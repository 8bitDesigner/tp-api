var request = require('request')

function configure(opts) {
  // Catch folks using the `new` keyword when invoking our configurator
  if (this instanceof configure) { return configure(opts) }

  if (!opts.token && opts.username && opts.password) {
    opts.token = new Buffer(opts.username+':'+opts.password).toString('base64')
  } else if (!opts.token) {
    throw new Error('A TargetProcess username and password is required')
  }

  if (!opts.domain) {
    throw new Error('A TargetProcess domain is required')
  }

  var version = opts.version || 1
  var domain = opts.domain
  var token = opts.token
  var urlRoot = 'https://'+domain+'/api/v'+version

  return function(entity) {
    var instance = new TPRequest(urlRoot, token);
    if (entity) { instance.get(entity) }
    return instance
  }
}

function TPRequest(baseUrl, token) {
  this.baseUrl = baseUrl
  this.opts = {
    json: true,
    qs: {},
    headers: { Authorization: 'Basic '+ token }
  }
}

TPRequest.prototype.entities = [
  'Projects', 'Features', 'Releases', 'Iterations', 'Requests',
  'CustomFields', 'Bugs', 'Tasks', 'TestCases', 'Times',
  'Impediments', 'Assignments', 'Attachments', 'Comments',
  'UserStories', 'Roles', 'GeneralUsers', 'Context'
]

TPRequest.prototype.get = function(entity) {
  this.opts.url = this.baseUrl+'/'+entity
  return this
}

TPRequest.prototype.take = function(number) {
  this.opts.qs.take = number
  return this
}

TPRequest.prototype.where = function(search) {
  this.opts.qs.where = search
  return this
}

TPRequest.prototype.pluck = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.exclude) { this.opts.js.exclude = null }
  this.opts.qs.include = '[' + args.join(',') + ']'
  return this
}

TPRequest.prototype.omit = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.include) { this.opts.js.include = null }
  this.opts.qs.exclude = '[' + args.join(',') + ']'
  return this
}

TPRequest.prototype.sortBy = function(property) {
  this.opts.qs.orderBy = property
  return this
}

TPRequest.prototype.then = function(cb) {
  request(this.opts, function(err, res, json) {
    if (json && json.Items) { json = json.Items }
    cb(err, json)
  })
}

module.exports = configure
