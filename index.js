var request = require('request')
var _ = require('lodash')

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
    var instance = new TPCollection(urlRoot, token);
    if (entity) { instance.get(entity) }
    return instance
  }
}

// Usage
// ---------
// tp.create({}, function(err, entity) {
//
// })
// 
// tp.get('Entity', 1234).fetch(err, entity) { })
// 
// tp.get('Entity', 1234).destroy()
// 
// tp.get('Entity', 1234).update({a: 'b'}, cb)


// TP Entities
// ----------------------
function TPEntity(data, options) {
  this.sync(data);
  this.options = {};
  this.sync.apply(this.options, options)

}

TPEntity.prototype.create = function(data, cb) {
  this.then(cb, {
    json: data,
    method: 'POST'
  })
}

TPEntity.prototype.update = function(data, cb) {
  this.then(cb, {
    json: data,
    method: 'PUT'
  })
}

TPEntity.prototype.delete = function(cb) {
  this.then(cb, {
    method: 'DELETE'
  })
}

TPEntity.prototype.sync(data){
  var self = this
  Object.keys(data).forEach(function(key) { self[key] = data[key] })
}

/**
 * Thin wrapper around then call
 * @param  {Function} cb expects (err, TPEntity(s))
 * @return {Object} TPEntity
 */
TPEntity.prototype.then = function(cb) {
  options = this.options
  TPSync.apply(this, function(err, data){
    if( err ) {
      return err;
    }
    this.sync(data);
    if( cb ) {
      cb(data);
    }  
  }, options);
}

// TP Entity Collection
// ----------------------
function TPCollection(baseUrl, token) {
  this.baseUrl = baseUrl
  this.opts = {
    json: true,
    qs: {},
    headers: { Authorization: 'Basic '+ token }
  }
}

TPCollection.prototype.entities = [
  'Projects', 'Features', 'Releases', 'Iterations', 'Requests',
  'CustomFields', 'Bugs', 'Tasks', 'TestCases', 'Times',
  'Impediments', 'Assignments', 'Attachments', 'Comments',
  'UserStories', 'Roles', 'GeneralUsers', 'Context'
]

/**
 * Synchronously create a TPEntity instance
 * @param  {Integer|String} entity id for TP item
 * @return {Object} TPEntity 
 */
TPCollection.prototype.get = function(entity) {
  // @todo add TPEntity fetching from cache?
  return new TPEntity({}, {
    baseUrl: this.baseUrl+'/'+entity
  })  
}

TPCollection.prototype.take = function(number) {
  this.opts.qs.take = number
  return this
}

TPCollection.prototype.where = function(search) {
  this.opts.qs.where = search
  return this
}

TPCollection.prototype.pluck = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.exclude) { this.opts.js.exclude = null }
  this.opts.qs.include = '[' + args.join(',') + ']'
  return this
}

TPCollection.prototype.omit = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.include) { this.opts.js.include = null }
  this.opts.qs.exclude = '[' + args.join(',') + ']'
  return this
}

TPCollection.prototype.sortBy = function(property) {
  this.opts.qs.orderBy = property
  return this
}

TPCollection.prototype.then = function(cb, options) {
  var opts = _.extend({}, this.opts, options)
  TPSync(cb, options)
}

// TPSync
// -----------------
function TPSync(cb, opts) {
  return request(opts, function(err, res, json) {
    if (json && json.Items) { json = json.Items }

    if (typeof json === 'string') {
      err = new Error("Couldn't find resorce at "+ opts.url)
    }

    if (json.Error) {
      err = new Error(json.Error.Message)
    }

    if (typeof err === 'string') {
      err = new Error(err)
    }

    cb(err, (err) ? null : json)
  })
}


module.exports = configure
