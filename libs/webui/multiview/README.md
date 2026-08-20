# multiview

Demo page for AWS Elemental Dynamic MultiView on MediaPackage V2.

Viewers pick source feeds and a layout; MediaPackage assembles the multiview on demand.
The page composes the multiview manifest URL from the selected layout and tiles, then plays
the resulting standard HLS stream in a single hls.js player.

## Running unit tests

Run `nx test multiview` to execute the unit tests via [Vitest](https://vitest.dev/).
