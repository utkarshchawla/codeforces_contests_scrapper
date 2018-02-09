var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var app = express();
var date = require('date-and-time');
const CONFIG = require('./settings');
const CalendarAPI = require('node-google-calendar');
var cal = new CalendarAPI(CONFIG);

let event = {
    'start': {'dateTime': '2018-02-20T07:00:00+08:00'},
    'end': {'dateTime': '2018-02-20T08:00:00+08:00'},
    'location': 'Coffeeshop',
    'summary': 'Breakfast',
    'status': 'confirmed',
    'description': '',
    'colorId': 1
};

cal.Events.insert(CONFIG.calendarId.primary, event)
    .then(resp => {
        console.log('inserted event:');
        console.log(resp);
    })
    .catch(err => {
        console.log('Error: insertEvent-' + err.message);
    });


app.get('/', function (req, response) {
    var url = 'http://codeforces.com/api/contest.list';
    var data = [];
    request(url, function (err, res, body) {
        body = JSON.parse(body);
        var now = new Date();
        body.result.forEach(function (item) {
            if (item.phase === 'BEFORE') {
                var obj = {
                    name: item.name,
                    date: date.addSeconds(now, -item.relativeTimeSeconds + 19800).toUTCString(),
                    duration: item.durationSeconds
                };
                data.push(obj);
            }
        });
        response.send(data);
        console.log(data.length);

    });
});


app.listen(process.env.PORT || 8000);
