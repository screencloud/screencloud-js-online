var util = require('util')
var EventEmitter = require('events').EventEmitter

function OnlineChecker (opts) {
  opts = opts || {}
  opts.checkImageURL = opts.checkImageURL || 'https://google.com/favicon.ico'
  opts.checkInterval = 10000
  this.opts = opts
}

util.inherits(OnlineChecker, EventEmitter)

OnlineChecker.prototype.init = function () {
  self = this
  window.addEventListener('online', function () {
    self.check()
  })
  window.addEventListener('offline', function () {
    self.check()
  })
  this._checkIntervalRef = setInterval(function () {
    self.check()
  }, this.opts.checkInterval)
  return this.check()
}

OnlineChecker.prototype.check = function () {
  var self = this
  var url = this.opts.checkImageURL + '?' + (new Date()).getTime()
  return this._checkImage(url).then(function () {
    return true
  }).catch(function (err) {
    return false
  }).then(function (online) {
    self.setOnline(online)
    return online
  })
}

OnlineChecker.prototype._checkImage = function (url) {
  return new Promise(function (resolve, reject) {
    // do we need a timeout here?
    var img = new window.Image()
    img.onload = resolve
    img.onerror = reject
    img.src = url
  })
}

OnlineChecker.prototype.setOnline = function (online) {
  if (this.online === online) return // no change
  this.online = online
  this.emit('statuschanged', this.online)
  if (this.online) this.emit('online')
  else this.emit('offline')
}

var onlineChecker = new OnlineChecker()

onlineChecker.on('online', function () {
  console.log('connection is online', true)
})

onlineChecker.on('offline', function () {
  console.log('connection is offline', true)
})

onlineChecker.init()

// stash in global
if (window.onlineChecker === undefined) {
  window.onlineChecker = onlineChecker
}

module.exports = onlineChecker
