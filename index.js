var child = require('child_process')
var through = require('through2')
var duplexify = require('duplexify')
var os = require('os')
var spawn = require('win-spawn')
var kill = require('tree-kill')
var xtend = require('xtend')

module.exports = DockerStream

var errors = {
  b2dMissing: "You need to install boot2docker to run docker on this OS." +
              "\n\nboot2docker is not currently installed on this machine or is not in your PATH." +
              "\n\nPlease visit http://docs.docker.com/installation/ for installation instructions.\n",
  b2dNotRunning: "boot2docker is installed but is not running." +
                 "\n\nPlease run the following command in your terminal to start it:" +
                 "\n\nboot2docker start\n",
  dockerMissing: "docker is not currently installed on this machine or is not in your PATH." +
                 "\n\nPlease visit http://docs.docker.com/installation/ for installation instructions.\n"
}

function DockerStream(imageName, options) {
  if (!(this instanceof DockerStream)) return new DockerStream(imageName, options)
  var self = this
  var platform = os.platform()
  if (!options) options = {}
  
  if (platform === 'darwin' || platform === 'win32') {
    this.b2dIP(function(err, ip) {
      if (err) return stream.destroy(err)
      if (!options.host) options.host = 'tcp://' + ip + ':2375'
      self.runDocker(imageName, options)
    })
  } else {
    self.runDocker(imageName, options)
  }
  
  var stream = duplexify()
  stream.dockerStream = this
  this.stream = stream
  return stream
}

DockerStream.prototype.runDocker = function(imageName, options) {
  var self = this
  self.getDockerVersion(function(err, version) {
    if (err) return self.stream.destroy(err)
    var env = xtend({"DOCKER_HOST": options.host}, process.env)
    var run = spawn('docker', ['run', '-i', '--rm', imageName], {env: env})
    self.stream.setReadable(run.stdout)
    self.stream.setWritable(run.stdin)
    run.on('error', function(err) {
      self.stream.destroy(err)
    })
    run.on('close', function() {
      kill(run.pid)
    })
  })
}

DockerStream.prototype.getDockerVersion = function(cb) {
  child.exec('docker -v', function(err, stdout, stderr) {
    if (err) {
      if (err.message.indexOf('not found') > -1) {
        return cb(new Error(errors.dockerMissing))
      } else {
        return cb(err)
      }
    }
    var output = stdout.toString()
    if (output.indexOf('version') > -1) {
      return cb(null, output)
    }
    cb(new Error('Unexpected output from docker: ' + output))
  })
}

DockerStream.prototype.b2dIP = function(cb) {
  child.exec('boot2docker ip', function(err, stdout, stderr) {
    if (err) {
      if (err.message.indexOf('is not running') > -1) {
        return cb(new Error(errors.b2dNotRunning))
      }
      if (err.message.indexOf('not found') > -1) {
        return cb(new Error(errors.b2dMissing))
      }
    }
    var output = stdout.toString()
    if (output === '') return cb(new Error(errMsg))
    // todo validate IP?
    cb(null, output)
  })
}