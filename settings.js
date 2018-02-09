const key = require('./googleapi-key.json').private_key;

const SERVICE_ACCT_ID = 'utkarshserviceaccount@my-project-1496518637663.iam.gserviceaccount.com';
const CALENDAR_ID = {
    'primary': '8bhprvurdmiau9edojk2mkk5g4@group.calendar.google.com',
    // 'calendar-1': '8bhprvurdmiau9edojk2mkk5g4@group.calendar.google.com'
};
const TIMEZONE = 'UTC+05:30';

module.exports.key = key;
module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.calendarId = CALENDAR_ID;
module.exports.timezone = TIMEZONE;