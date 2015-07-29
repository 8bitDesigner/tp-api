var TPSync = require('./tpsync')
var _ = require('lodash')
var noop = function(){}

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
  if(!cb) { cb = noop }

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
    var err = new Error("setState: state with name " + stateName + " is not an allowed state to move to from " + that.EntityState.Name + ", please check your spelling and the available state names")
    if( data[0] && data[0].NextStates && data[0].NextStates.Items ) {
      var targetState = _.findWhere(data[0].NextStates.Items, {Name: stateName})
      if(targetState) {
        that.update({
          Id: that.Id,
          EntityState: targetState
        }, cb)
      } else if( cb ) {
        cb(err, {})
      }
    } else {
      cb(err, {})
    }
  })
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
  if(!cb) { cb = noop }
  opts.json = _.extend({}, opts.json || {})
  if( this.Id ) {
    // mixing in id so TP will be able to get the right object
    opts.json = _.extend(opts.json, {Id: this.Id})
  }
  var options = _.extend({}, this.opts, opts)
  var that = this
  TPSync(options, function(err, data){
    if( err ) {
      return cb(err);
    }
    that.sync(data);
    cb(err, data);
  });
}

module.exports = TPEntity