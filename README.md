# Trackflix Live

![CI status badge](https://github.com/trackit/trackflix-live/actions/workflows/nx.yaml/badge.svg)

![Trackflix Live Status view](assets/trackflix-live.png)

This project utilizes AWS Elemental MediaLive and MediaPackage to transform MP4 files into live streams,
all running on AWS using serverless services.
MediaLive ingests the MP4 files, processes them in real time, and converts them into live stream formats.
MediaPackage ensures secure and reliable delivery of the live stream across multiple devices.
By leveraging AWS serverless architecture, the solution scales automatically,
minimizing operational overhead and providing a cost-efficient, high-quality live streaming experience for global audiences.

## Smart cropping

The solution also offers an optional **smart cropping** feature powered by [AWS Elemental Inference](https://docs.aws.amazon.com/elemental-inference/).
When smart cropping is enabled for an event, Elemental Inference analyzes the source video in real time and automatically reframes the
horizontal (16:9) stream into a vertical (9:16) format, keeping the region of interest (speakers, action, etc.) centered.
This produces a portrait-oriented stream suited to mobile and social platforms, delivered through a dedicated MediaPackage endpoint
and CloudFront distribution, alongside the standard horizontal output.

Concretely, when an event has smart cropping enabled, the back-end creates an Elemental Inference *feed* before starting the MediaLive
channel, wires it into the channel, and deletes the feed when the transmission ends.

This project is a mono-repo using [Nx](https://nx.dev/) as its build system.

# Code quality and Unit tests

You can run Prettier, ESLint, type checks and unit tests using the following commands:

```shell
$ nx run-many -t lint # Runs ESLint on all Nx projects
$ nx run-many -t prettier # Runs Prettier on all Nx projects
$ nx run-many -t typecheck  # Runs Typescript type-checking on all Nx projects
$ nx run-many -t test  # Runs unit tests on all Nx projects
```

# Back-end

More information in the Back-end [README.md](apps/api/README.md)

# Front-end

More information in the Back-end [README.md](apps/webui/README.md)

# License

Copyright 2025 TrackIt

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[LICENSE.md](./LICENSE.md)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
