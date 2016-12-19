  //
//  Index.js
//  Violet
//
//  Created by Nabyl Bennouri on 10/03/16.
//  Copyright © 2015 Ultra Inc. All rights reserved.


var express = require('express')
var cors = require('cors');
var helper = require('./helper.js');

var app = express();
var WunderNodeClient = require("wundernode");
var URL = require('url');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(cors());

// Set to true if you want to see all sort of nasty output on stdout.
var debug = false;
var t2IU = 15500 / 3.2;
var standardBSA = 1.70; //m2
var ASCF = 1.0;

// RapidAPI API
const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI('Tayri', 'f1fff787-6991-43d2-8cd7-a2817fdb8e84');

// Weather Underground API
var wuAPIKey = '1a713a4bd9e9ffa5';
var wunder = new WunderNodeClient(wuAPIKey, debug,  10, 'minute');

// we can also return errors, lets do it every time
app.get('/v1/peoples/error', function(request, response) {
    response.status(404).send({ error : "Let's return an error"});
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});


 // weather
 app.get('/v1/weather/condition', function(request, response) {
   var query = URL.parse(request.url).query;
      console.log('query pre: ' +  query);

      var querySplit = query.split(",");

      var city = querySplit[0];
      var state = querySplit[1];
      var cityText = helper.titleCase(city.replace("+", " "));
      var stateText = helper.titleCase(state.replace("+", " "));

      query = cityText + "," + stateText;
      console.log('query post: ' +  query);

      wunder.conditions(query, function(err, obj) {
        var parsedBody = JSON.parse(obj);
        console.log('parsedBody: ' + parsedBody);
        console.log('parsedBody.current_observation: ' + parsedBody.current_observation);
        if (err || parsedBody.current_observation == undefined) {
          console.log('undefined');
          if (err) {
            console.log('errors: ' + err);
          }
          response.send([
           { "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Oh non! I can't find your location. Are you sure you did not mispell it?",
              "buttons": [
                {
                  "type": "show_block",
                  "block_name": "UV Advice Part 2",
                  "title": "Try again"
                },
                {
                  "type": "show_block",
                  "block_name": "Default answer",
                  "title": "Move on"
                }
              ]
            }
          }
        }
      ]);
    } else {
     console.log('Icon: ' + parsedBody.current_observation.icon);
     console.log('UV Index: ' + parsedBody.current_observation.UV);
     var uvindex = parseInt(parsedBody.current_observation.UV);
     var uvindexTxt = parsedBody.current_observation.UV;
     // Sometimes Weather Underground gets back with UV Index = -1
     if (uvindex < 0) {
       uvindex = 0;
       uvindexTxt = "0";
     }
     var uvText = "";
     if (uvindex == NaN) {
       uvText = "Unfortunatly I couldn't find the UV Index in " + parsedBody.current_observation.display_location.city;
     } else if (uvindex <= 2) {
       uvText = "You don't have to worry for now. The UV Index is low at " + uvindexTxt;
     } else if (uvindex <= 5) {
       uvText = "Be careful mon ami! the UV Index is " + uvindexTxt + ". Don't stay too long in the sun without sunscreen";
     } else if (uvindex <= 7) {
       uvText = "Oh dear! Put some sunscreen on. The UV Index is " + uvindexTxt;
     } else if (uvindex <= 10) {
       uvText = "Don't let the sun burn your skin. The UV Index is extremely high at" + uvindexTxt;
     } else if (uvindex > 11) {
       uvText = "It's hell outside. The UV Index is " + uvindexTxt + ". Avoid the sun";
     }

      response.send([
        {"text": "It's " + parsedBody.current_observation.temp_f + " \u00B0F and " + parsedBody.current_observation.weather + " in " + parsedBody.current_observation.display_location.full },
        { "attachment": {
         "type": "template",
         "payload": {
           "template_type": "button",
           "text": uvText,
           "buttons": [
             {
               "type": "show_block",
               "block_name": "UV Advice Part 8",
               "title": "✔"
             }
           ]
         }
       }
     }
      ]);

    }
   });
 });

 // weather
 app.get('/v1/weather/test', function(request, response) {
   var query = URL.parse(request.url).query;
      console.log('query pre: ' +  query);


      response.send([
        {"Tayri":  "App Alive!"}
      ]);
 });

 app.get('/v1/weather/forecast', function(request, response) {
   var query = URL.parse(request.url).query;
   console.log('query pre: ' +  query);

   var querySplit = query.split(",");

   var city = querySplit[0];
   var state = querySplit[1];
   var cityText = helper.titleCase(city.replace("+", " "));
   var stateText = helper.titleCase(state.replace("+", " "));

   query = cityText + "," + stateText;
   console.log('query post: ' +  query);
      wunder.forecast(query, function(err, obj) {
        var parsedBody = JSON.parse(obj);
        console.log('query: ' + query);
        console.log('parsedBody: ' + parsedBody);
        console.log('parsedBody.current_observation: ' + parsedBody.forecast);
        if (err || parsedBody.forecast == undefined) {
          console.log('undefined');
          if (err) {
            console.log('errors: ' + err);
          }
          response.send([
           { "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Oh non! I can't find your location. Are you sure you did not mispell it?",
              "buttons": [
                {
                  "type": "show_block",
                  "block_name": "UV Advice Part 2",
                  "title": "Try again"
                },
                {
                  "type": "show_block",
                  "block_name": "Default answer",
                  "title": "Move on"
                }
              ]
            }
          }
        }
      ]);
    } else {
     console.log('period: ' + parsedBody.forecast.txt_forecast.forecastday[0]);
     console.log('icon_url: ' + parsedBody.forecast.txt_forecast.forecastday[0].icon_url);
     console.log('us_text: ' + parsedBody.forecast.txt_forecast.forecastday[0].fcttext);
     console.log('eu_text: ' + parsedBody.forecast.txt_forecast.forecastday[0].fcttext_metric);

     // Get weather gif url
     var gifUrl = "http://bot.liveultrahealthy.com/images/weather/unknown.gif"
     var imageUrl = parsedBody.forecast.txt_forecast.forecastday[0].icon_url
     console.log('imageUrl: ' + imageUrl);
     var urlArray = imageUrl.split("/")
     console.log('urlArray: ' + urlArray);
     var imageName = urlArray[urlArray.length-1]
     console.log('imageName: ' + imageName);
     var imageName = imageName.split(".")[0]
     console.log('imageName: ' + imageName);
     if (imageName == "chancerain") {
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/chancerain.gif"
     } else if (imageName == "sleet"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/sleet.gif"
     } else if (imageName == "chancesnow"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/chancesnow.gif"
     } else if (imageName == "chancetstorms"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/chancetstorms.gif"
     } else if (imageName == "clear"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/clear.gif"
     } else if (imageName == "cloudy"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/cloudy.gif"
     } else if (imageName == "flurries"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/flurries.gif"
     } else if (imageName == "fog"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/fog.gif"
     } else if (imageName == "hazy"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/hazy.gif"
     } else if (imageName == "mostlycloudy"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/mostlycloudy.gif"
     } else if (imageName == "mostlysunny"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/mostlysunny.gif"
     } else if (imageName == "partlycloudy"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/partlycloudy.gif"
     } else if (imageName == "partlysunny"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/partlysunny.gif"
     } else if (imageName == "rain"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/rain.gif"
     } else if (imageName == "snow"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/snow.gif"
     } else if (imageName == "tstorms"){
       gifUrl = "http://bot.liveultrahealthy.com/images/weather/tstorms.gif"
     }

      response.send([
        {"text":  parsedBody.forecast.txt_forecast.forecastday[0].fcttext},
        { "attachment": {
           "type": "template",
           "type": "image",
           "payload": {
             "url": gifUrl
           }
         }
       }
      ]);

    }
   });
 });


 // uv
 app.get('/v1/weather/uv', function(request, response) {
   var query = URL.parse(request.url).query;
   var querySplit = query.split(",");

   console.log('query pre: ' +  querySplit[0] + "," + querySplit[1]);

   var querySplit = query.split(",");

   var city = querySplit[0];
   var state = querySplit[1];
   var cityText = helper.titleCase(city.replace("+", " "));
   var stateText = helper.titleCase(state.replace("+", " "));

   var wuStr = cityText + "," + stateText;
   console.log('query post: ' +  wuStr);

   var skinType = parseInt(querySplit[2]);
   var spf = parseInt(querySplit[3]);

   console.log('app.get(/v1/weather/uv: wuStr = ' +  wuStr);
   console.log('app.get(/v1/weather/uv: skinType = ' +  skinType);

   wunder.conditions(wuStr, function(err, obj) {
    var parsedBody = JSON.parse(obj);
    if (err || parsedBody.current_observation == undefined) {
      console.log('app.get(/v1/weather/uv: undefined');
      if (err) {
        console.log('app.get(/v1/weather/uv: errors = ' + err);
      }
      response.send([
       { "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Oh non! I can't find your location. Are you sure you did not mispell it?",
          "buttons": [
            {
              "type": "show_block",
              "block_name": "UV Advice Part 2",
              "title": "Try again"
            },
            {
              "type": "show_block",
              "block_name": "Default answer",
              "title": "Move on"
            }
          ]
        }
      }
    }
  ]);
    } else {
     console.log('UV: ' + parsedBody.current_observation.UV);
     var uvindex = parseInt(parsedBody.current_observation.UV);
     // Sometimes Weather Underground gets back with UV Index = -1
     if (uvindex < 0) {
       uvindex = 0;
     }
     var uvTime = getMaxUVTime (uvindex, skinType, spf);
     console.log('app.get(/v1/weather/uv: uvTime = ' + uvTime);
     var hours = Math.floor(uvTime/3600);
     console.log('app.get(/v1/weather/uv: hours = ' + hours);
     var minutes = Math.floor(uvTime/60-hours*60);
     console.log('app.get(/v1/weather/uv: minutes = ' + minutes);
     var seconds = uvTime-minutes*60-hours*3600;
     console.log('app.get(/v1/weather/uv: seconds = ' + seconds);

     response.send([
      { "attachment": {
       "type": "template",
       "payload": {
         "template_type": "button",
         "text": "Your skin will start getting damaged after " + hours + "h" + minutes + "min" + seconds + "s",
         "buttons": [
           {
             "type": "show_block",
             "block_name": "UV Advice Subscribe",
             "title": "Get Daily Advice"
           },
           {
             "type": "show_block",
             "block_name": "Default answer",
             "title": "Move on"
           }
         ]
       }
     }
   }
 ]);
 }
})
});


// vitamin d
 app.get('/v1/weather/vitamind', function(request, response) {
   var query = URL.parse(request.url).query;
   var querySplit = query.split(",");
   console.log('/v1/weather/vitamind:' +  query);

   var wuStr = querySplit[0] + "," + querySplit[1];
   var skinType = parseInt(querySplit[2]);
   var spf = 1;
   var upper_clothing = querySplit[3];
   var lower_clothing = querySplit[4];
   var vitaminDTarget = parseInt(getVitaminDNumber(querySplit[5]));

  //  var age = parseInt(querySplit[5]);
  //  var height = parseInt(querySplit[6]);
  //  var weight = parseInt(querySplit[7]);
  //  var upper_clothing = parseInt(querySplit[8]);
  //  var lower_clothing = parseInt(querySplit[9]);

  var city = querySplit[0];
  var state = querySplit[1];
  var cityText = helper.titleCase(city.replace("+", " "));
  var stateText = helper.titleCase(state.replace("+", " "));

  var wuStr = cityText + "," + stateText;

   var age = 20;
   var height = 170;
   var weight = 73
   console.log('app.get(/v1/weather/vitamind: wuStr = ' +  wuStr);
   console.log('app.get(/v1/weather/vitamind: skinType = ' +  skinType);

   wunder.conditions(wuStr, function(err, obj) {
    var parsedBody = JSON.parse(obj);
    if (err || parsedBody.current_observation == undefined) {
      console.log('app.get(/v1/weather/uv: undefined');
      if (err) {
        console.log('app.get(/v1/weather/uv: errors = ' + err);
      }
      response.send([
       { "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Oh non! I can't find your location. Are you sure you did not mispell it?",
          "buttons": [
            {
              "type": "show_block",
              "block_name": "UV Advice Part 2",
              "title": "Try again"
            },
            {
              "type": "show_block",
              "block_name": "UV Advice Part 3",
              "title": "Move on"
            }
          ]
        }
      }
    }
  ]);
    } else {
     console.log('UV: ' + parsedBody.current_observation.UV);
     var uvindex = parseInt(parsedBody.current_observation.UV);
     // Sometimes Weather Underground gets back with UV Index = -1
     if (uvindex < 0) {
       uvindex = 0;
     }
     var vitTime = getVitaminDMaxTime(uvindex, spf, vitaminDTarget, age, height, weight, upper_clothing, lower_clothing);
     console.log('app.get(/v1/weather/vitamind: vitTime = ' + vitTime);
     var hours = Math.floor(vitTime/3600);
     console.log('app.get(/v1/weather/vitamind: hours = ' + hours);
     var minutes = Math.floor(vitTime/60-hours*60);
     console.log('app.get(/v1/weather/vitamind: minutes = ' + minutes);
     var seconds = vitTime-minutes*60-hours*3600;
     console.log('app.get(/v1/weather/vitamind: seconds = ' + seconds);

     response.send([
       {"text": "You need to be outside " + hours + "h" + minutes + "min" + seconds + "s to get " +vitaminDTarget + "IU of vitamin D"},
     ]);
    }
   });
 });

// Daily forecast
app.get('/v1/weather/uvdaily', function(request, response) {
     console.log('/v1/weather/uvdaily');
     var query = URL.parse(request.url).query;
     console.log('query: ' +  query);
     var querySplit = query.split(",");

     var city = querySplit[0];
     var state = querySplit[1];
     var cityText = helper.titleCase(city.replace("+", " "));
     var stateText = helper.titleCase(state.replace("+", " "));

     var jsonRequest = require('request');
     var absState = abbrState(stateText, 'abbr');

     console.log('city: ' + cityText);
     console.log('state: ' + stateText);
     console.log('absState: ' + absState);

     jsonRequest('https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVDAILY/CITY/' + cityText + '/STATE/' +
     absState + '/json', function (error, resp, body) {
       console.log('error: ' + error);
       console.log('resp.statusCode: ' + resp.statusCode);
       if (!error && resp.statusCode == 200) {
         console.log(body);
         var parsedBody = JSON.parse(body);
         console.log('parsedBody[0]: ' + parsedBody[0]);
         console.log('parsedBody[0].CITY: ' + parsedBody[0].CITY);
         console.log('parsedBody[0].STATE: ' + parsedBody[0].STATE);
         console.log('parsedBody[0].UV_INDEX: ' + parsedBody[0].UV_INDEX);
         console.log('parsedBody[0].UV_ALERT: ' + parsedBody[0].UV_ALERT);

         var uvindex = parseInt(parsedBody[0].UV_INDEX);
         var uvindexTxt = parsedBody[0].UV_INDEX;
         // Sometimes Weather Underground gets back with UV Index = -1
         if (uvindex < 0) {
           uvindex = 0;
           uvindexTxt = "0";
         }
         var uvText = "";
         if (uvindex <= 2) {
           uvText = "You don't have to worry today. The UV Index in " + cityText + ", " + stateText + " will be low at " + uvindexTxt;
         } else if (uvindex <= 5) {
           uvText = "Be careful mon ami! the UV Index today in " + cityText + ", " + stateText + " is " + uvindexTxt + ". Don't stay too long in the sun without sunscreen";
         } else if (uvindex <= 7) {
           uvText = "Oh dear! Put some sunscreen on to avoid aging your skin fast. The UV Index today in " + cityText + ", " + stateText + " is " + uvindexTxt;
         } else if (uvindex <= 10) {
           uvText = "Don't let the sun burn your skin. The UV Index in " + cityText + ", " + stateText + " is extremely high today at" + uvindexTxt;
         } else if (uvindex > 11) {
           uvText = "It's hell outside. The UV Index today in " + cityText + ", " + stateText + " is " + uvindexTxt + ". Avoid the sun!";
         } else {
           uvText = "Unfortunatly I couldn't find the UV Index in " + cityText + ", " + stateText;
         }

         response.send([
              {"text": uvText},
          ]);
       } else {
         response.send([
          { "attachment": {
           "type": "template",
           "payload": {
             "template_type": "button",
             "text": "Oh la la! I apologyze but I can't find the UV Index in " + city + ", "
             + state + ". Are you sure you did not mispell it?",
             "buttons": [
               {
                 "type": "show_block",
                 "block_name": "UV Advice Part 2",
                 "title": "Change location"
               },
               {
                 "type": "show_block",
                 "block_name": "Au revoir",
                 "title": "Au revoir!"
               }
             ]
           }
         }
       }
     ]);
   }
 })
});

// Location
app.get('/v1/weather/location', function(request, response) {
     console.log('/v1/weather/location');
     var query = URL.parse(request.url).query;
     console.log('query: ' +  query);
     var querySplit = query.split(",");
     var jsonRequest = require('request');

     var city = querySplit[0];
     var state = querySplit[1];
     var cityText = helper.titleCase(city.replace("+", " "));
     var stateText = helper.titleCase(state.replace("+", " "));

     console.log('city: ' + cityText);
     console.log('state: ' + stateText);

     var jsonLink = 'http://api.wunderground.com/api/' + wuAPIKey + '/geolookup/q/'
     + stateText + '/' + cityText + '.json';
     console.log('jsonLink: ' + jsonLink);
     jsonRequest(jsonLink, function (error, resp, body) {
       console.log('error: ' + error);
       console.log('resp.statusCode: ' + resp.statusCode);
       var parsedBody = JSON.parse(body);
       if (!error && resp.statusCode == 200 && (typeof parsedBody.location != 'undefined')) {
         console.log('Country: ' + parsedBody.location.country_name);
         console.log('State: ' + parsedBody.location.state);
         console.log('City: ' + parsedBody.location.city);

         var textLocation = "You told me you were in " + parsedBody.location.city + ", " + parsedBody.location.state + ". Right?"
          response.send([
           { "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": textLocation,
              "buttons": [
                {
                  "type": "show_block",
                  "block_name": "Au Revoir",
                  "title": "Yes"
                },
                {
                  "type": "show_block",
                  "block_name": "Change location",
                  "title": "Change my location"
                }
              ]
            }
          }
        }
      ]);
       } else {
         response.send([
          { "attachment": {
           "type": "template",
           "payload": {
             "template_type": "button",
             "text": "Oh la la! I apologyze but I can't find this location. City = \"" + cityText + "\", State = \""
             + stateText + ". Are you sure you did not mispell it?",
             "buttons": [
               {
                 "type": "show_block",
                 "block_name": "Change location",
                 "title": "Change location"
               },
               {
                 "type": "show_block",
                 "block_name": "Au revoir",
                 "title": "Au revoir!"
               }
             ]
           }
         }
       }
     ]);
   }
 })
});

// Location
app.get('/v1/weather/iflocation', function(request, response) {
     console.log('/v1/weather/if');
     var query = URL.parse(request.url).query;
     console.log('query: ' +  query);
     var querySplit = query.split(",");

     var city = querySplit[0];
     var state = querySplit[1];
     var cityText = helper.titleCase(city.replace("+", " "));
     var stateText = helper.titleCase(state.replace("+", " "));

     console.log('city: ' + city);
     console.log('state: ' + state);

     if (city == "" || state == "") {
       console.log('State: Empty');
       response.send([
        { "attachment": {
         "type": "template",
         "payload": {
           "template_type": "button",
           "text": "I need to know a couple of things before we move along.",
           "buttons": [
             {
               "type": "show_block",
               "block_name": "Weather Forecast 3",
               "title": "Okay"
             }
           ]
         }
       }
     }
   ]);
     } else {
       console.log('State: Not');
       response.send([
        { "attachment": {
         "type": "template",
         "payload": {
           "template_type": "button",
           "text": "Do you want the weather conditions for " + cityText + ", " + stateText + "?",
           "buttons": [
             {
               "type": "show_block",
               "block_name": "Weather Forecast 2",
               "title": "Yes"
             },
             {
               "type": "show_block",
               "block_name": "Weather Forecast 3",
               "title": "No"
             }
           ]
         }
       }
     }
   ]);
     }
});

// UV Times
function getMaxUVTime (uvIndex, skinType, spf) {

console.log('getMaxUVTime(' + uvIndex + ',' + skinType + ',' + spf + ')');
var maxUVDose = getMaxUVDose(skinType);
console.log('getMaxUVTime: maxUVDose = ' + maxUVDose);
 var UVTime = 0.0;

 if (uvIndex == NaN) {
   uvText = -1;
 }

if (uvIndex >= 0 ) {
     var uvIntensity = uvIndex * 0.025;

     var spfLifeSpan = 2.0 * 60 * 60; // 2 Hours
     var timeOut = 10.0 * 60 * 60; // 10 hours
     var accumulatedUVDDoseForLoop = 0.0;

     var spfTimer = 0.0;

     // Adjust SPF
     if (spf <= 1) {
       spf == 1;
     }
     if ( spf >= 50) {
       spf == 50;
     }
     var absoluteSPF = spf;

     // Simulating time
     while (accumulatedUVDDoseForLoop <= maxUVDose) {
         effectiveSPF = 1.0;
         if (spfTimer < spfLifeSpan) {
             effectiveSPF = (1 - absoluteSPF) / spfLifeSpan * spfTimer + absoluteSPF
             spfTimer += 1
         } else {
             // Set the SPF button value back to NONE. SPF has vaporated
         }
         accumulatedUVDDoseForLoop += uvIntensity / effectiveSPF
         UVTime += 1

         if (UVTime >= timeOut) {
             break;
         }
     }

     return UVTime
 } else {
     UVTime = -1
     return UVTime
 }
}

function getMaxUVDose (skinType) {
console.log('getMaxUVDose(' + skinType + ')');
 switch (skinType) {
      case 1:
          return 200.0;
      case 2:
          return 250.0;
      case 3:
          return 350.0;
      case 4:
          return 450.0;
      case 5:
          return 600.0;
      case 6:
          return 1000.0;
      default:
          return 250.0;
      }
}

// Vitamin D
function getVitaminDMaxTime(uvIndex, spf, vitaminDTarget, age, height, weight, upper_coverage, lower_coverage) {
    console.log('getVitaminDMaxTime(' + uvIndex + ')');

    if (uvIndex == NaN) {
      uvText = -1;
    }
    var uvDose = uvIndex * 0.025;
    var SED = 0.5 * uvDose / 100.0;

    var STF = getSTF(uvIndex);
    var AF = getAF(age);
    var BSARatio = getBSARatio(height, weight);
    var barePercentage = getBarePercentage(upper_coverage, lower_coverage);

    var spfLifeSpan = 2.0 * 60 * 60;
    var accumulatedVitDDoseForLoop = 0.0;
    var VitDTime = 0.0;
    var spfTimer = 0.0;
    var timeOut = 10.0 * 60 * 60; // 10 hours
    var absoluteSPF = spf;

    while (accumulatedVitDDoseForLoop <= vitaminDTarget) {
        effectiveSPF = 1.0;
        if (spfTimer < spfLifeSpan) {
            effectiveSPF = (1 - absoluteSPF) / spfLifeSpan * spfTimer + absoluteSPF;
            spfTimer += 1;
        } else {
            // Set the SPF button value back to NONE. SPF has vaporated
        }
        accumulatedVitDDoseForLoop += (SED * ASCF * t2IU * STF * barePercentage * AF * BSARatio) / effectiveSPF;
        VitDTime += 1;

        if (VitDTime >= timeOut) {
            break;
        }
    }

    return VitDTime;
}

function getSTF(skinType) {
    console.log('getSTF(' + skinType + ')');

    switch (skinType) {
      case 1:
          return 3.2 / 2;
      case 2:
          return 3.2 / 2.5;
      case 3:
          return 3.2 / 3.5;
      case 4:
          return 3.2 / 4.5;
      case 5:
          return 3.2 / 6;
      case 6:
          return 3.2 / 10;
      default:
          return 3.2 / 2.5;
    }
}

function getAF(age) {
  console.log('getAF(' + age + ')');

    var AF = 0.0;

    if (age <= 20) {
        AF = 1.0;
    } else {
        AF = (0.25 - 1.0) / (70.0 - 20.0) * (age - 20) + 1.0;
    }
    return AF;
}

function getBSARatio(height, weight) {
    console.log('getBSARatio(' + height + ", " + weight +')');

    var _weight = weight * 0.45359237;
    var _height = height * 2.54;

    var BSA = 0.20247 * Math.pow(height/100.0, 0.725) * Math.pow(weight, 0.425);
    var BSARatio = BSA / standardBSA;

    return BSARatio;
}

function getBarePercentage(upper_coverage, lower_coverage) {
    console.log('getBarePercentage(' + upper_coverage + ", " + lower_coverage + ')');

    var coverage = 0.0;

    switch (upper_coverage) {
      case "nothing":
          coverage += 0.0;
      case "bikini":
          coverage += 10.0;
      case "sleeveless":
          coverage += 25.0;
      case "short%20sleeve":
          coverage += 35.0;
      case "long%20sleeve":
          coverage += 45.0;
    }

    switch (lower_coverage) {
      case "bikini":
          coverage += 10.0;
      case "short%20shorts":
          coverage += 22.0;
      case "shorts":
          coverage += 25.0;
      case "long%20skirt":
          coverage += 40.0;
      case "capris":
          coverage += 40.0;
      case "pants":
          coverage += 49.0;
    }

    return (100.0 - coverage) / 100.0;
}

function getVitaminDNumber(vitamind) {
  console.log('getVitaminDNumber(' + vitamind + ')');

  switch (vitamind) {
    case "NIH":
        return 600;
    case "Linus+Pauling":
        return 1000;
    case "Vit+D+Council":
        return 2000;
    case "Endocrine+Society":
        return 5000;
  }
}

// USAGE:
// abbrState('ny', 'name');
// --> 'New York'
// abbrState('New York', 'abbr');
// --> 'NY'

function abbrState(input, to) {
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr') {
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }
        return "Error"
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }
        return "Error"
    }
}
