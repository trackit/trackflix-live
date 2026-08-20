# MultiView demo

Demo stack for [AWS Elemental Dynamic MultiView](https://trackflix-live.demo.trackit.io/multiview)
(MediaPackage V2 private beta), used to power the `/multiview` page of the web UI.

## Quick tour

This stack provisions, per source feed, one [MediaLive](https://aws.amazon.com/medialive/) channel with
the small multiview renditions, feeding a single [MediaPackage V2](https://aws.amazon.com/mediapackage/)
channel group whose name starts with `MultiView-Preview` (this prefix is what routes the account to the
beta origination). MediaPackage composes the mosaic on demand from an `aws.multiview=...` query on the
manifest URL, and the whole thing is fronted by a [CloudFront](https://aws.amazon.com/cloudfront/)
distribution. The web UI plays the composited stream in a single standard player.

The template is plain CloudFormation: a parent (`template.yaml`) with the shared resources (IAM role,
channel group, CloudFront) plus one nested stack (`source.yaml`) per source feed. It deploys with `sam
deploy` like the `api` and `webui` apps; the SAM config lives in `samconfig.toml`.

## Prerequisites

- Node: [Install Node](https://nodejs.org/en/download)
- AWS SAM CLI: [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Valid AWS credentials for the target account (this project uses `aws-vault exec <profile> -- ...`)
- `uv` (for the cfn-lint validate target): [Install uv](https://docs.astral.sh/uv/)
- `yt-dlp` and `ffmpeg` (only to rebuild the source assets)

Set the stage in the root `.env` file (same convention as the `api` app):

```dotenv
STAGE=<your_stage_name>
```

The stage is injected into the stack name, so `STAGE=demo` deploys `trackflix-multiview-demo`. There are no
separate SAM config environments; the stage variable is the only knob.

## Deploy

```shell
$ nx run multiview-demo:deploy
```

This runs `sam deploy` (capabilities and the artifacts bucket come from `samconfig.toml`). It creates the
channel group, CloudFront distribution, and the MediaLive channels. **The MediaLive channels are created in
the IDLE state**: deploying does not start them.

Validate the templates without deploying:

```shell
$ nx run multiview-demo:validate
```

## Prepare the source assets

The MediaLive channels read H.264/AAC MP4s from S3 (MediaLive cannot decode AV1/Opus). To (re)build them
from the configured YouTube sources:

```shell
$ nx run multiview-demo:prepare-sources
```

Edit the source list in `scripts/prepareMultiviewSources.sh`, keeping it in sync with the `SourceKey`
values in the nested stacks and the catalogue in `libs/webui/multiview/src/lib/sources.ts`.

## Start / stop the channels

MediaLive channels are billed only while RUNNING. The deploy leaves them IDLE, so start them for the demo
window and stop them afterwards:

```shell
$ STAGE=demo nx run multiview-demo:start     # start the mv-*-<stage> channels
$ STAGE=demo nx run multiview-demo:status    # STARTING / RUNNING / IDLE
$ STAGE=demo nx run multiview-demo:stop       # stop after the demo
```

Under the hood these call `sh scripts/multiviewChannels.sh {start|stop|status}`, which targets the channels
named `mv-<source>-<stage>`. Run them under your credentials, for example:

```shell
$ STAGE=demo aws-vault exec trackit-demo -- sh scripts/multiviewChannels.sh start
```

Note: MediaPackage keeps a short time-shift window (15 min), so the page may keep replaying the last
retained segments for a few minutes after you stop the channels.

## Wire the web UI

After the stack is deployed, deploying the web UI picks up the outputs automatically (its
`generateEnvironment` step reads the `trackflix-multiview-$STAGE` stack outputs):

```shell
$ nx run webui:upload
```

## Teardown

Stop the channels first (a RUNNING MediaLive channel blocks stack deletion), then delete the stack:

```shell
$ STAGE=demo nx run multiview-demo:stop
$ STAGE=demo nx run multiview-demo:destroy
```
