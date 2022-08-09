var _ = require('underscore'),
  request = require("request"),
  qs = require('querystring');

var endpoint = "https://api.cognitive.microsofttranslator.com/";

var translateText = function (apiKey) {
  return function (data, sourceLang, targetLang, done) {
    var requestData = {
      baseUrl: endpoint,
      url: "translate",
      qs: {
        "api-version": "3.0",
        to: targetLang,
        from: sourceLang,
      },
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-type": "application/json",
        // 'X-ClientTraceId': uuidv4().toString()
      },
      body: JSON.stringify(data.map((d) => ({ text: String(d) }))),
    };
    request(requestData, globalResponseHandler(requestData, done));
  };
};

var globalResponseHandler = function(request, done) {
  return function(err, res, body) {
    var msg;
    if (!done || !_.isFunction(done)) return;
    // Catch connection errors
    if (err || !res || res.statusCode !== 200) return done({
      error: err,
      response: res,
      body: body,
      request: request,
      toString: function() {
        return err ? err.toString() : '';
      },
    }, null);

    // Try to parse response
    var parsedBody = null;
    try {
      parsedBody = JSON.parse(body);
    } catch(e) {
      err = 'Could not parse response from Microsoft: ' + (body || 'null');
      return done(err, null);
    }

    // Return response
    done(null, parsedBody);
  };
};

module.exports = function(apiKey) {

  var translateFunc = translateText(apiKey);

  return {
    translate: translateFunc
  }
}