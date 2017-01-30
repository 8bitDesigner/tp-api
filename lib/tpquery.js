var TPSync = require('./tpsync')
var TPEntity = require('./tpentity')
var _ = require('lodash')

// TP Entity Query
// ----------------------
function TPQuery(baseUrl, token) {
  this.baseUrl = baseUrl
  this.opts = {
    json: true,
    qs: { token: token },
    headers: { Authorization: 'Basic '+ token }
  }
}

TPQuery.prototype.entities = [
  'Projects', 'Features', 'Releases', 'Iterations', 'Requests',
  'CustomFields', 'Bugs', 'Tasks', 'TestCases', 'Times',
  'Impediments', 'Assignments', 'Attachments', 'Comments',
  'UserStories', 'Roles', 'GeneralUsers', 'Context', 'EntityState',
  'TeamIterations'
]

TPQuery.prototype.get = function(entity) {
  this.opts = _.extend({}, this.opts, {
    json: true,
    uri: this.baseUrl+'/'+entity
  })
  return this;
}

// Query Building Methods
// ----------------------------------------------------------------------------

TPQuery.prototype.take = function(number) {
  this.opts.qs.take = number
  return this
}

TPQuery.prototype.skip = function(number) {
  this.opts.qs.skip = number
  return this
}

TPQuery.prototype.where = function(search) {
  this.opts.qs.where = search
  return this
}

TPQuery.prototype.context = function(context) {
  this.opts.qs.acid = context
  return this
}

TPQuery.prototype.pluck = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.exclude) { this.opts.js.exclude = null }
  this.opts.qs.include = '[' + args.join(',') + ']'
  return this
}

TPQuery.prototype.omit = function() {
  var args = Array.prototype.slice.call(arguments)

  if (this.opts.qs.include) { this.opts.js.include = null }
  this.opts.qs.exclude = '[' + args.join(',') + ']'
  return this
}

TPQuery.prototype.sortBy = function(property) {
  this.opts.qs.orderBy = property
  return this
}

TPQuery.prototype.sortByDesc = function(property) {
  this.opts.qs.orderByDesc = property
  return this
}

TPQuery.prototype.append = function() {
  var args = Array.prototype.slice.call(arguments)

  this.opts.qs.append = '[' + args.join(',') + ']'
  return this
}


// Async Methods
// ----------------------------------------------------------------------------
/**
 * Simple callback structure for fetching queries
 * @param  {Function} cb
 */
TPQuery.prototype.then = function(cb) {
  var opts = this.opts
  var that = this
  TPSync(opts, function(err, data){
    cb(err, data);
  })
}

/**
 * wrapper around #then that generates a simple collection of TPEntities from
 * the response
 * @param  {Function} cb should receive {Object} err, and {Array} Entities a collection
 * of TPEntities
 */
TPQuery.prototype.thenEntities = function(cb) {
  var that = this
  this.then(function(err, data) {
    var entities = []
    if( data ) {
      // @todo maybe change this if TP API automatically changes when we exceed
      // the page limit
      data.forEach(function(entityData, index){
        entities.push(new TPEntity(_.extend({}, entityData, {
          baseUrl: that.baseUrl
        }), that.opts))
      })
    }
    cb(err, entities)
  })
}

TPQuery.prototype.comment = function(entityId, comment, cb) {
  var that = this
  var commentEntity = new TPEntity({}, that.opts)
  commentEntity.then({
    json: {
      Description: comment,
      General: { Id: entityId }
    },
    uri: that.baseUrl + '/Comments',
    method: 'POST'
    // ParentId: entityId
  }, cb)
}

module.exports = TPQuery
