# React Next.js Snapshot demo

Quick and simple snapshotting demo for Next.js React applications. Inspiration is pulled from `react-snapshot`.

## Brief Overview

`./build.js` runs through a few steps when creating a snapshot:

- copies bundle files created during `next build`
- starts a Next.js server
- crawls the application recursively starting at `/`, storing the pages in the process

## Configuration

Configuration is currently controlled through environment variables:

- `HOST` - host to crawl. Defaults to `http://localhost`
- `PORT` - port to access on `$HOST`. Defaults to `3000`
- `DESTINATION` - destination directory for snapshot build files. Defaults to `./build`
- `NPM_EXECPATH` - `npm` exe to use when starting the Next.js server. Defaults to `npm`. Yarn will set this to `yarn` when runninng the script with YARN
- `NOM_SCRIPT` - script to use when starting the Next.js server. Defaults to `start`
