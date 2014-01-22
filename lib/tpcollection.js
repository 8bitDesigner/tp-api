var TPSync = require('tpsync')
var TPEntity = require('tpentity')

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

TPCollection.prototype.get = function(baseUrl, token) {
  this.baseUrl = baseUrl
  this.opts = {
    json: true,
    baseUrl: this.baseUrl+'/'+token
  }
  return this;
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

TPCollection.prototype.then = function(cb) {
  var opts = this.opts
  var that = this
  TPSync(function(err, data){
    var tasks = []
    if( data ) {
      data.Items.forEach(function(taskData, index){
        tasks.push(new TPEntity(taskData, that.opts))
      }) 
    }
    cb(err, tasks)
  }, opts)
}

module.exports = TPCollection