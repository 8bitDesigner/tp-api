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

module.exports = TPSync