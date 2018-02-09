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
                    'start': {'dateTime': date.addSeconds(now, -item.relativeTimeSeconds + 19800)},
                    'end': {'dateTime': date.addSeconds(now, -item.relativeTimeSeconds + 19800 + item.durationSeconds)},
                    'summary': item.name,
                    'status': 'confirmed',
                    'description': '',
                    'colorId': 1
                };
                data.push(event);
            }
        });

        data = [{
            'start': {'dateTime': '2018-02-20T07:00:00+08:00'},
            'end': {'dateTime': '2018-02-20T08:00:00+08:00'},
            'location': 'Coffeeshop',
            'summary': 'Breakfast',
            'status': 'confirmed',
            'description': '',
            'colorId': 1
        }]
        response.send(data);
        // console.log(data.length);
        data.forEach(function (event) {
            var list = [];
            var start = event.start.dateTime;
            var end = event.end.dateTime;
            let params = {
                timeMin: start,
                timeMax: end,
                // q: 'query term',
                singleEvents: true,
                orderBy: 'startTime'
            }; 	//Optional query parameters referencing google APIs

            cal.Events.list(calendarId, params)
                .then(json => {
                    //Success
                    console.log('List of events on calendar within time-range:');
                    // console.log(json + "+" + typeof json);
                    list = Object.values(json);
                    // console.log(list + "+" + typeof list);
                    // console.log('----------------------------------------------------------------------------------------\n')
                    list.forEach(function (item) {
                        // console.log("inside foreach" + item.kind + "   " + item.id);

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
                    cal.Events.insert(calendarId, event)
                        .then(resp => {
                            console.log('inserted event:');
                            console.log(resp);
                        })
                        .catch(err => {
                            console.log('Error: insertEvent-' + err.message);
                        });
                }).catch(err => {
                //Error
                console.log('Error: listSingleEvents -' + err.message);
            });
        });
    });
});

app.listen(process.env.PORT || 8000);
