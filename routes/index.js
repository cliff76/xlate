var express = require('express');
var router = express.Router();

var authenticationURL = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken';
var apiURL = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
var apiName = 'SpeechAPI';
var apiKey1 = 'secretkey1';
var apiKey2 = 'secretkey2';

var bearerToken;

var request = require('request-promise');
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
  res.render('index', { title: 'Express' });
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

    doTranslate('kor', 'Nice to meet you!').then(result => {
        res.render('xlate', { translation: result});
    });
});

module.exports = router;
