# MultiView: IBC integration and deployment plan

## Context

AWS Elemental Dynamic MultiView (MediaPackage V2 private beta, launching at IBC 2026) lets viewers
combine 2 to 4 live feeds into a single, server-composited HLS/DASH stream. TrackIt is an allowlisted
implementation partner (account 471112864823). We built the front-end page and validated the full real
pipeline manually on `trackit-demo` (us-west-2). This plan covers turning that manual proof into a
reproducible deployment we can stand up and demo at IBC.

## What is already done (branch `feat/multiview-demo-ui`)

- New Nx feature lib `libs/webui/multiview` + route `/multiview` + Topbar link.
- Correct real manifest contract in `libs/webui/multiview/src/lib/manifest-url.ts`:
  `https://<egress>/out/v1/<channel-group>/<FIRST-source>/<endpoint>/index.m3u8?aws.multiview=layout:<CODE>%3Bsources:s1,s2[,s3,s4]`
  (the `;` is `%3B`; the URL-path channel must equal the first source).
- Six real layouts (`2EH, 3EL, 4E, 2PL, 3PL, 4PL`), source catalogue, tile assignment UI, and a single
  `MultiviewPlayer` (hls.js) that plays the composited stream. Falls back to a client-side tiled preview
  when no real endpoint is configured.
- Endpoint config read from env: `VITE_MULTIVIEW_EGRESS_DOMAIN`, `VITE_MULTIVIEW_CHANNEL_GROUP`,
  `VITE_MULTIVIEW_ENDPOINT_NAME`.
- 13 unit tests green; typecheck/lint/prettier green.

## What we validated manually (the pipeline to codify)

End to end on trackit-demo, confirmed a real composited 4E/3EL stream playing in the browser:

1. MediaPackage V2 channel group whose name starts with `MultiView-Preview` (this prefix + the
   allowlisted account is what routes to the beta origination).
2. One MP V2 channel per source (`--input-type CMAF`) + one origin endpoint per channel
   (`SegmentDurationSeconds: 2`, HLS manifest with `UrlEncodeChildManifest: true`, required so the
   `aws.multiview` param survives into child-manifest URIs).
3. A channel policy per channel granting the MediaLive role `mediapackagev2:PutObject`.
4. One MediaLive channel per source with the multiview renditions: AVC 1024x576@5M, 512x288@1.25M,
   256x144@500k, output group name contains "Multiview Preview" (triggers the beta validations and the
   automatic black tile borders), CMAF ingest into the MP V2 channel.
5. CloudFront in front: OAC of type `mediapackagev2` (sigv4, always), a cache policy forwarding all
   query strings (so `aws.multiview` reaches the origin and is part of the cache key), a CORS response
   headers policy, and endpoint policies scoped to the distribution ARN.

Gotcha that cost us time (document loudly): **MediaLive cannot decode AV1 video or Opus audio.** The
demo bucket MP4s were YouTube-derived AV1/Opus, so channels ran but produced nothing (manifest 404).
Sources must be H.264/AAC.

## Recommended integration approach

Two paths, and we should do the first for IBC and the second after.

### A. IBC path: a dedicated, mostly-static demo stack (recommended now)

The multiview demo is a fixed set of sources feeding one channel group behind one CloudFront
distribution. That is infrastructure, not a per-viewer event, so declare it as IaC and just start the
encoders for the demo window.

**Tooling: CloudFormation (implemented in `apps/multiview-demo`).** We chose CFN for consistency with
the rest of trackflix (SAM/CFN), as a separate stack deployed in the same nx flow (like `apps/webui`).
The template uses `Transform: AWS::LanguageExtensions` + `Fn::ForEach` to declare the N per-source
resources from one loop (DRY). Caveat found during implementation: **the SAM CLI cannot parse
`Fn::ForEach`** (sam build/validate crash on the list-valued loop entry), so the stack deploys with
`aws cloudformation deploy` (transforms expand server-side) and lints with `cfn-lint` (nx `validate`
target). cfn-lint raises E1020/E3005 false positives on ForEach intra-loop `Ref`/`DependsOn` (real CFN
resolves the documented `!Ref '<Name>${Id}'` pattern), so those two checks are ignored. All resource
schemas (MediaLive/MediaPackageV2/CloudFront) validate clean. `AWS::MediaPackageV2::*` and CloudFront
OAC (`OriginAccessControlOriginType: mediapackagev2`) are fully CFN-supported.

**Resources the stack declares (per stage):**

- `MediaPackageV2::ChannelGroup` named `MultiView-Preview-trackflix-<stage>` (prefix is mandatory).
- N `MediaPackageV2::Channel` (`InputType: CMAF`), one per source (soccer, motorsport, …).
- N `MediaPackageV2::OriginEndpoint` (`ContainerType: CMAF`, 2s segments, HLS manifest
  `UrlEncodeChildManifest: true`, root URI path type).
- N `MediaPackageV2::ChannelPolicy` granting the MediaLive role `mediapackagev2:PutObject`.
- A MediaLive IAM role (or reuse `trackflix-live-<stage>-MediaLiveRole`).
- N `MediaLive::Input` (MP4_FILE, looping) + N `MediaLive::Channel` with the multiview encoder settings
  (port `generate_multiview_json.py` into a shared CDK helper / JSON asset).
- One `CloudFront::Distribution` (OAC mediapackagev2, cache policy = all query strings, CORS,
  HTTPS), with N `MediaPackageV2::OriginEndpointPolicy` scoped to the distribution ARN.
- Stack outputs: CloudFront domain, channel group name, endpoint name, MediaLive channel IDs.

Note: MediaLive channels are the only meaningful cost, and they bill only while running. Keep the
stack deployed; start/stop the encoders around the demo (runbook below).

### B. Productization path: a native multiview event type (after IBC)

Mirror the smart-cropping slice so multiview becomes a first-class trackflix event:

- `libs/shared/types`: add `EventType.MULTIVIEW` and a `multiview` payload (sources[], layouts[]).
- `libs/api/api-events`: new port `MultiviewPackageManager` + use case `createMultiviewChannels`
  (fan-out N channels into one MP V2 channel group), with in-memory fakes and tests.
- `apps/api/src/infrastructure`: a real `MediaPackageV2ChannelsManager` adapter
  (`@aws-sdk/client-mediapackagev2`, the repo is on v1 today) + MediaLive multiview encoder profile.
- `apps/api/src/stateMachines` + `template.yaml`: a `Map` state that fans out channel creation; IAM
  `mediapackagev2:*` on the MediaLive/step roles.
- Webui: promote `/multiview` from static catalogue to reading the event's real sources/endpoint.

This is the correct trackflix integration but larger; not needed to demo at IBC.

## Source assets (do this before the stack)

Curate H.264/AAC MP4s in `s3://demo-videos-trackflix-live/` (or a dedicated `mv-*` prefix). We already
produced `mv-soccer.mp4`, `mv-football.mp4`, `mv-basketball.mp4` (ffmpeg: `-c:v libx264 -profile:v main
-c:a aac`, 720p, capped duration, `+faststart`). For smooth looping, prefer clips of similar length so
the source timelines stay close; a live/loop-locked source is ideal for the final demo. Keep at least
4 to 6 distinct sports clips so all layouts (up to 4PL) have real content.

## Webui wiring

- Extend `scripts/generateWebUiEnvironment.sh` (or add `generateMultiviewEnvironment.sh`) to read the
  demo stack outputs and write `VITE_MULTIVIEW_EGRESS_DOMAIN` / `_CHANNEL_GROUP` / `_ENDPOINT_NAME`
  into `apps/webui/.env`.
- The `/multiview` route and Topbar link are already in place; no further webui changes needed for the
  static path.

## Demo runbook (per session)

1. `nx run multiview-demo:deploy` (once per stage; infra is cheap at rest).
2. Ensure H.264/AAC sources are uploaded.
3. Start encoders: `aws medialive start-channel` for each channel (script/nx target).
4. `generateMultiviewEnvironment.sh` then `nx build webui` + deploy (or `nx serve` for local).
5. Open `/multiview`, verify the composited stream, point the booth QR code at it.
6. After the demo: stop the MediaLive channels (billing). Optionally `nx run multiview-demo:destroy`.

## Open items and risks

- **Beta constraints**: testing only, H.264 only (no HEVC yet), audio rendition groups / captions not
  fully supported, no multiview-specific API or pricing yet. GA will add MultiView-specific endpoints,
  so `manifest-url.ts` may need a small change at GA.
- **Time alignment**: independently looping MP4s can drift and cause brief segment gaps at loop points.
  Use similar-length clips or a locked source for a clean IBC demo.
- **CloudFront OAC**: confirmed supported for mediapackagev2; the CDK alpha construct is the cleanest,
  but pin the alpha version.
- **Region**: stay in a beta region (us-west-2 works and matches `trackflix-live-demo`).
- **Cost**: N MediaLive channels bill while running; keep them stopped outside the demo window.

## Verification

- Single-view sanity: `GET https://<cf>/out/v1/<CG>/<ch>/<EP>/index.m3u8` → 200.
- MultiView: append `?aws.multiview=layout:3EL%3Bsources:soccer,motorsport,basketball` → 200 with a
  master playlist whose top variant is the stitched resolution (e.g. 2048x1152 for 3EL).
- Browser: `/multiview` plays the mosaic; changing layout/tiles recomposes server-side.
