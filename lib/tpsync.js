request = require('request')

function TPSync(opts, cb) {
  return request(opts, function(err, res, json) {
    if (typeof json === 'string') {
      err = new Error("Couldn't find resource at "+ opts.uri)
    }

    if (json && json.Error) {
      err = new Error(json.Error.Message)
    }

    if (typeof err === 'string') {
      err = new Error(err)
    }

    // normalize reponse data
    if (json && json.Items) { json = json.Items }

    cb(err, (err) ? null : json)
  })
}

module.exports = TPSync