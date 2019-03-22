var express = require('express');
var router = express.Router();

var authenticationURL = 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken';
let naverApiURL = "https://openapi.naver.com/v1/language/translate";
var bingApiURL = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
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

function getBingTranslation(response) {
    return response[0].translations[0].text;
}

function doTranslate(to, input, api) {
  const uri = api === 'naver' ? naverApiURL : bingApiURL +'&from=en&to=' + to;
  const headers = api === 'naver' ? {'X-Naver-Client-Id': 'pdrAJgv_e215VWgXVRyN', 'X-Naver-Client-Secret': 'WnyHdHQ307'
  } : {
      'Ocp-Apim-Subscription-Key': apiKey1,
      'Authorization': bearerToken
  };
    const body = api === 'naver' ? {source: 'en', target: to, text:input} : [
        {"Text":input}
    ];
  return request({
    uri: uri,
    method: 'POST',
    body: body,
    json: true,
    headers: headers,
  })
      .then(function(response) {
          translation = api === 'naver' ? response.message.result.translatedText : getBingTranslation(response);
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
    const to = (req.query.to) ? req.query.to : 'ko';
    const api = req.query.api ? req.query.api : 'bing';
    doTranslate(to, req.query.toxlate, api).then(result => {
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
