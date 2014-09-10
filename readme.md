# docker-stream

CLI tool for automating the use of docker containers in streaming data processing pipelines. Works on Windows, Mac and Linux.

[![NPM](https://nodei.co/npm/docker-stream.png?global=true)](https://nodei.co/npm/docker-stream/)

## Installation

```
npm install docker-stream -g
```

You also need to install [docker](http://docs.docker.com/installation/). If you are on Linux you should only need docker. If you are on Mac/Windows you should install boot2docker instead.

## Usage

```
docker-stream <docker container tag or id>
```

This will only work with containers that have an [`entrypoint` in their `Dockerfile`](https://docs.docker.com/reference/builder/#entrypoint) set to a program that accepts STDIN and writes to STDOUT/STDERR. Data piped into `docker-stream` will be piped into the docker container's entrypoint and then back out again.

If you run `docker-stream` with a container that isn't downloaded yet docker will automatically download it for you.

## Try it out

```
echo '{"foo": "bar"}' | docker-stream maxogden/docker-r-transform
```