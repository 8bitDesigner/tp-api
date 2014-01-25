var request = require('request')
var _ = require('lodash')
var TPQuery = require('./lib/tpquery')
var TPEntity= require('./lib/tpentity')

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

  return function(entity, id) {
    var collection = new TPQuery(urlRoot, token)
      , model

    if (entity) { collection.get(entity) }
    if (entity && id) {
      model = new TPEntity({Id: id}, collection.opts)
    }

    return (model) ? model : collection
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


module.exports = configure
