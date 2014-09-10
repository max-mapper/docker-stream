#!/usr/bin/env node

var dockerStream = require('./')
var fs = require('fs')
var args = require('minimist')(process.argv.slice(2))

if (!args._[0]) {
  console.error('Usage: docker-stream <docker container tag or id>')
  process.exit(1)
}

var stream = dockerStream(args._[0], args)

stream.on('error', function(err) {
  console.error(err.message)
})

stream.pipe(process.stdout)
process.stdin.pipe(stream)
