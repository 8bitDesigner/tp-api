var TPSync = require('./tpsync')
var _ = require('lodash')

// TP Entities
// ----------------------
function TPEntity(data, options) {
  this.sync(data);
  this.opts = {};
  if( options ) {
    this.sync.call(this.opts, options)
  }
}

TPEntity.prototype.create = function(data, cb) {
  this.then(cb, {
    json: data,
    method: 'POST'
  })
}

TPEntity.prototype.update = function(data, cb) {
  console.log('entity update');
  this.then(cb, {
    json: data,
    method: 'POST' // TP sucks at REST.
  })
}

TPEntity.prototype.delete = function(cb) {
  this.then(cb, {
    method: 'DELETE',
    uri: this.opts.uri + '/' + this.Id
  })
}

TPEntity.prototype.nextState = function(cb) {

}

TPEntity.prototype.prevState = function(cb) {

}

TPEntity.prototype.sync = function(data){
  var self = this
  Object.keys(data).forEach(function(key) { self[key] = data[key] })
}

/**
 * Thin wrapper around then call
 * @param  {Function} cb expects (err, TPEntity(s))
 * @return {Object} TPEntity
 */
TPEntity.prototype.then = function(opts, cb) {
  opts.json = _.extend({}, opts.json) // mixing in id so TP will be able to get the right object
  var options = _.extend({}, this.opts, opts)
  var that = this
  console.log('entity then')
  console.log(options)
  TPSync(function(err, data){
    console.log('tpsync return')
    console.log(err)
    console.log(data)
    if( err ) {
      return err;
    }
    that.sync(data);
    if( cb ) {
      cb(err, data);
    }  
  }, options);
}

module.exports = TPEntity