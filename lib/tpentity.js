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

TPEntity.prototype.sync = function(data){
  var self = this
  Object.keys(data).forEach(function(key) { self[key] = data[key] })
}

/**
 * Thin wrapper around then call
 * @param  {Function} cb expects (err, TPEntity(s))
 * @return {Object} TPEntity
 */
TPEntity.prototype.then = function(cb) {
  var options = this.opts
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

module.exports = TPEntity