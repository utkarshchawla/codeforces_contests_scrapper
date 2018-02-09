var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var app = express();
var date = require('date-and-time');
const CONFIG = require('./settings');
const CalendarAPI = require('node-google-calendar');
var cal = new CalendarAPI(CONFIG);
var calendarId = CONFIG.calendarId.primary;


app.get('/', function (req, response) {
    var url = 'http://codeforces.com/api/contest.list';
    var data = [];
    request(url, function (err, res, body) {
        body = JSON.parse(body);
        var now = new Date();
        body.result.forEach(function (item) {
            if (item.phase === 'BEFORE' && item.name.includes('Div. 2')) {
                let event = {
                    'start': {'dateTime': date.addSeconds(now, -item.relativeTimeSeconds)},
                    'end': {'dateTime': date.addSeconds(now, -item.relativeTimeSeconds + item.durationSeconds)},
                    'summary': item.name,
                    'status': 'confirmed',
                    'description': '',
                    'colorId': 1
                };
                data.push(event);
            }
        });

        response.send(data);

        data.forEach(function (event) {

            var list = [];
            var start = date.addSeconds(event.start.dateTime, 19800).toISOString().substring(0, 19) + "+05:30";
            var end = date.addSeconds(event.start.dateTime, 27000).toISOString().substring(0, 19) + "+05:30";
            let params = {
                timeMin: start,
                timeMax: end,
                //q : 'query term'',
                singleEvents: true,
                orderBy: 'startTime'
            }; 	//Optional query parameters referencing google APIs

            cal.Events.list(calendarId, params)
                .then(json => {
                    console.log('List of events on calendar within time-range:');
                    list = Object.values(json);
                    list.forEach(function (item) {
                        console.log("inside foreach" + item.summary + "   " + item.id);
                        if (item.summary === event.summary) {
                            let params = {
                                sendNotifications: true
                            };
                            cal.Events.delete(calendarId, item.id, params)
                                .then(results => {
                                    console.log('delete Event:' + JSON.stringify(results));
                                }).catch(err => {
                                console.log('Error deleteEvent:' + JSON.stringify(err.message));
                            });
                        }
                    })
                }).catch(err => {
                console.log('Error: listSingleEvents -' + err.message);
            });
            cal.Events.insert(calendarId, event)
                .then(resp => {
                    console.log('inserted event:');
                    console.log(resp);
                })
                .catch(err => {
                    console.log('Error: insertEvent-' + err.message);
                });
        });
    });
});
app.listen(process.env.PORT || 8000);
