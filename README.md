# Trackflix Live

![CI status badge](https://github.com/trackit/trackflix-live/actions/workflows/nx.yaml/badge.svg)

This project utilizes AWS Elemental MediaLive and MediaPackage to transform MP4 files into live streams,
all running on AWS using serverless services.
MediaLive ingests the MP4 files, processes them in real time, and converts them into live stream formats.
MediaPackage ensures secure and reliable delivery of the live stream across multiple devices.
By leveraging AWS serverless architecture, the solution scales automatically,
minimizing operational overhead and providing a cost-efficient, high-quality live streaming experience for global audiences.

This project is a mono-repo using [Nx](https://nx.dev/) as its build system.


# Back-end

More information in the Back-end [README.md](apps/api/README.md)

# Front-end

More information in the Back-end [README.md](apps/webui/README.md)
