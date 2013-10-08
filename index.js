var request = require('request')

function toArgs(args) {
  return Array.prototype.slice.call(args)
}

function TP(opts) {
  opts = opts || {}

  if (!opts.domain || !opts.token) {
    throw new Error('Token and domain are required')
  }

  this.version = opts.version || 1 
  this.domain = opts.domain
  this.token = opts.token
  this.urlRoot = 'https://'+this.domain+'/api/v'+this.version
}

TP.prototype.handle = function(cb) {
  return function(err, res, json) {
    if (json.Items) { json = json.Items }
    cb(err, json)
  }
}

TP.prototype.get = function(/* entity, [opts, ] callback */) {
  var args = toArgs(arguments)
    , cb = args.pop()
    , entity = args.shift()
    , qs = args.pop() || {}

  var opts = {
    url: this.urlRoot +'/'+ entity,
    json: true,
    qs: qs,
    headers: { Authorization: 'Basic '+ this.token }
  }
  
  request(opts, this.handle(cb))
}


var entities = [ 'Projects', 'Features', 'Releases', 'Iterations', 'Requests',
                 'CustomFields', 'Bugs', 'Tasks', 'TestCases', 'Times',
                 'Impediments', 'Assignments', 'Attachments', 'Comments',
                 'UserStories', 'Roles', 'GeneralUsers'
]

entities.forEach(function(entity) {
  TP.prototype[entity.toLowerCase()] = function() {
    var args = toArgs(arguments)
    args.unshift(entity)
    this.get.apply(this, args)
  }
})

module.exports = TP
