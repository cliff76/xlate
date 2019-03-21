var express = require('express');
var router = express.Router();

var authenticationURL = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken';
var apiURL = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
var apiName = 'SpeechAPI';
var apiKey1 = process.env.SAPI_KEY;

var bearerToken;

var request = require('request-promise');
var transliterate = require('transliteration').transliterate;

function authenticate() {
  var options = {
    uri: authenticationURL,
    method: 'POST',
    body: "",
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey1
    }
  };
  console.log("Authenticating against speech API");
  request(options)
      .then(function(response) {
        console.log("Authentication response:", response);
        bearerToken = 'Bearer ' + response;
      })
      .catch(function (error){
        console.error("ERROR!", error);
      });
}

if(! bearerToken) authenticate();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Translation' });
});

function doTranslate(from, input) {
  return request({
    uri: apiURL +'&from=en&to=ko',
    method: 'POST',
    body: [
        {"Text":input}
    ],
    json: true,
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey1,
      'Authorization': bearerToken
    },
  })
      .then(function(response) {
          translation = response[0].translations[0].text;
          console.log('API Response ', translation);
          return translation;
      })
      .catch(function(error) {
        console.log('API Error!', error);
      });
}

/* GET translation page. */
router.get('/xlate', function(req, res, next) {
  if(! bearerToken) authenticate();
    doTranslate('kor', req.query.toxlate).then(result => {
        if(req.query.transliterate) {
            result = transliterate(result);
        }
        if (! req.query.format || req.query.format === 'html') {
            res.render('xlate', {translation: result});
        } else if(req.query.format === 'text'){
            res.send(result);
        } else if(req.query.format === 'json'){
            res.send({translation: result, transliteration: transliterate(result)});
        } else {
            res.send('unsupported format query string parameter ' + res.query.format);
        }
    });
});

module.exports = router;
