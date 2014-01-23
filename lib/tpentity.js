var TPSync = require('./tpsync')
var _ = require('lodash')

// TP Entities
// ----------------------
function TPEntity(data, options) {
  data = data || {}
  this.sync(data);
  this.opts = {};
  if( options ) {
    this.sync.call(this.opts, options)
  }
}

TPEntity.prototype.create = function(data, cb) {
  this.then({
    json: data,
    method: 'POST'
  }, cb)
}

TPEntity.prototype.update = function(data, cb) {
  this.then({
    json: data,
    method: 'POST' // TP sucks at REST.
  }, cb)
}

TPEntity.prototype.delete = function(cb) {
  this.then({
    method: 'DELETE',
    uri: this.opts.uri + '/' + this.Id
  }, cb)
}

TPEntity.prototype.setState = function(stateName, cb) {
  var entityState = new TPEntity(this.EntityData, this.opts)
  
  var that = this
  console.log('nextState')
  // Get all legal next states
  entityState.then({
    uri: this.baseUrl + '/EntityStates',
    method: 'GET',
    // force build a query for our current entity state
    qs: { 
      where: 'Id eq ' + this.EntityState.Id,
      include: '[NextStates]'
    },
    json: true
  }, function(err, data){
    console.log(data)
    if( data[0] && data[0].NextStates && data[0].NextStates.Items ) {
      var targetState = _.findWhere(data[0].NextStates.Items, {Name: stateName})
      console.log(targetState)
      that.update({
        Id: that.Id,
        EntityState: targetState
      });
    }
  })
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
  opts.json = _.extend({}, opts.json || {})
  if( this.Id ) {
    // mixing in id so TP will be able to get the right object
    opts.json = _.extend(opts.json, {Id: this.Id})
  }
  var options = _.extend({}, this.opts, opts)
  var that = this
  TPSync(function(err, data){
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