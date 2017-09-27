// server.js
// where your node app starts
var http = require("http");
var https = require("https");
var fs = require("fs");
var querystring = require('querystring');

const { execSync } = require('child_process');

// init project
var express = require('express');
var app = express();

var token = "470423265:AAFNppOsnPtJV8kUdBjoGvKEGdHKpygCIF0"
var url = "https://super-cook.glitch.me/" + token
var telegram_api = "https://api.telegram.org/"//402243532:AAHds37dMd2Q_TTN4xsO1WdHmc25lU8pXOw/setWebhook?url=https://super-cook.glitch.me/402243532:AAHds37dMd2Q_TTN4xsO1WdHmc25lU8pXOw"
var api_url = telegram_api + "bot" + token

// https://super-cook.glitch.me/402243532:AAHds37dMd2Q_TTN4xsO1WdHmc25lU8pXOw


var updates = [];
var update_last_id = 0;

function censor(censor) {
  var i = 0;

  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
      return '[Circular]'; 

    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';

    ++i; // so we know we aren't using the original object anymore

    return value;  
  }
}

function replyToMessage(message, myMessage, replyMarkup) {
  var text = "" + myMessage + ""
  var method = "/sendMessage"
  var data = "?chat_id=" + message.chat.id +
                          "&parse_mode=Markdown" +
  ((!replyMarkup) ? "" : ("&reply_to_message_id=" + message.message_id) ) +
                          "&text=" + encodeURIComponent(text)

  console.log("get", api_url + method + data) 
  https.get( api_url + method + data )
  
}

function getUpdates() {
  var method = "/getUpdates"
  var data = "?offset=" + (update_last_id+1)
  
  request(api_url + method + data, function(res) {
    if (!res.ok) return;
    
    for (var key in res.result) {
      var update = res.result[key]
      updates.push( update )
      update_last_id = update.update_id
      handleUpdate(update)
    }
  })
}

function handleUpdate(update) {
  if (!update.message.photo) {
    var code = update.message.text;
    console.log("get",code)
    return 
  }

  replyToMessage(update.message, "Хм...", false)
  
  var ph = update.message.photo
  var photo = ph[2] || ph[1] || ph[0]
  var file_id = photo.file_id
  var data = "?file_id=" + file_id  

  request(api_url + "/getFile" + data, function (res){
    if (!res.ok) return;

    var file_path = res.result.file_path

    var url = telegram_api + "file/bot" + token + "/" + file_path
    var dest = "public/" + file_path
    download(url, dest, function(result) {
      if ( is_cat(dest) ) {
        response = "Это кот."
      } else {
        response = "Это не кот."
      }
 
      console.log(url, response)
      replyToMessage(update.message, response, true)
    })
  })
  
  console.log(update.message)
}

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
}

function is_cat(filename) {
  var command = "source ~/tensorflow/bin/activate; python cats.py " + filename

  try {
    console.log(command)
  
    var str = execSync(command)
  } catch (e) {
    console.err(e)
    return false
  }

  console.log("response", str.toString())

  return str.toString().includes("cat")
}

function request(url, callback) {
  
  https.get(url, function (res) {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (res.statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
    
      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        return;
      }
    
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          callback(parsedData)
        } catch (e) {
          console.error(e.message);
        }
      });
  })
}

function startCycle() {
  setInterval(getUpdates, 500)
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/" + token, function(req, res) {
  
  var message = JSON.stringify(req.query, censor(req.query), 4)
  
  console.log(message)
  console.log(req.query)
  
  var url = replyToMessage(message)
  
  https.get(url, function(response) {
    res.send("{}");
  })
  
})

// listen for requests :)

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  startCycle();
});
