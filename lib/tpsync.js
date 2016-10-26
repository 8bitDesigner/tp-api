var request = require('request');
var dotNetDate = require('json-dotnet-date')({
  useInputTimeZone: true
});

var jsonReviver = function(key, value) {
  if (dotNetDate.testStr(value)) {
    return dotNetDate.parse(value);
  }
  return value;
}

function TPSync(opts, cb) {

  // Remap options, because we want to use our own JSON.parse
  if (opts.json) {
    opts.headers['content-type'] = 'application/json';
    opts.json = false;
  }

  return request(opts, function(err, res, body) {
    // TP returns XML in case of errors. Yay. ¯\_(ツ)_/¯
    if (body.indexOf('<Error>') === 0) {
      err = new Error('Couldn\'t find resource at ' + opts.uri + ' ' + JSON.stringify(opts.qs));
      cb(err, null);
      return;
    }

    var json = null;
    try {
      json = JSON.parse(body, jsonReviver);
    } catch (e) {
      err = new Error("Can't parse JSON: \n" + body);
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
