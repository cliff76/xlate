var express = require('express');
var router = express.Router();

var authenticationURL = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken';
var apiURL = 'https://westus.api.cognitive.microsofttranslator.com/translate?api-version=3.0';
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
    method: 'GET',
    body: "",
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey1,
      'Authorization': bearerToken
    }
  })
      .then(function(response) {
        console.log('API Response ' + response)
      })
      .catch(function(error) {
        console.log('API Error!', error);
      });
}

/* GET translation page. */
router.get('/xlate', function(req, res, next) {
  if(! bearerToken) authenticate();

  res.render('xlate', { translation: doTranslate('kor', 'Nice to meet you!')});
});

module.exports = router;
