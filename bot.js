var twit = require('twit');
var config = require('./config.js');
var moment = require('moment');
var json2csv = require('json2csv');
var fs = require('fs');
var nodemailer = require('nodemailer');

var Twitter = new twit(config.tweeter);
var fileName = 'latestTweets.csv';

var last24Hours = function(tweet) {
  var _24HAgo = moment().subtract(1, 'days');
  return moment(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ gggg').isSameOrAfter(_24HAgo);
};

var sendCsvFile = function() {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mail_user,
      pass: config.mail_password
    }
  });

  var mailOptions = {
    from: config.mail_user,
    to: 'dev@guesty.com',
    subject: fileName + ' Liran Hershko',
    text: fileName + " from Liran Hershko's code",
    attachments: [
      {
        path: fileName
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
};

var createCsvFile = function(data) {
  var csv = json2csv({ data: data });

  fs.writeFile(fileName, csv, function(err) {
    if (err) throw err;
    console.log('file saved');
    sendCsvFile();
  });
};

var processRecentTweets = function(err, data) {
  if (!err) {
    var tweetsToSend = data.statuses.filter(last24Hours);
    if (tweetsToSend.length) {
      createCsvFile(tweetsToSend);
    }
  } else {
    console.log('error fetching tweets');
  }
};

var findTweets = function() {
  var params = {
    q: '#airbnb',
    result_type: 'recent',
    lang: 'en'
  };

  Twitter.get('search/tweets', params, processRecentTweets);
};

findTweets();
