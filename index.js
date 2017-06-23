var SlackBot = require('slackbots');
var fs = require('fs');
var http = require('http');

var params = {
    icon_emoji: ':robot_face:'
};

// create a bot 
var bot = new SlackBot({
    token: process.env.SLACKBOT_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token  
    name: 'Casual Bot'
});

bot.on('start', function () {
    // more information about additional params https://api.slack.com/methods/chat.postMessage 

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services  
    bot.postMessageToChannel('general', 'hello everybody', params);

});

bot.on('message', function (data) {
    // all ingoing events https://api.slack.com/rtm 
    if (data.type == 'message') {
        if (data.text != null && data.text.startsWith('<@' + bot.self.id + '>')) {
            let tokens = data.text.split(" ");
            let command = tokens[1];
            let user = data.user;
            switch (command) {
                case 'hello':
                    bot.getUserById(user).then(function (data) {
                        bot.postMessageToChannel('general', 'Hello <@' + data.id + '> ' + data.profile.first_name, params)
                    })
                    break;
                case 'ls':
                    fs.readdir('.', function (err, items) {
                        bot.postMessageToChannel('general', 'Current directory contains: ' + items, params)
                    });
                    break;
                case 'private':
                    bot.getUserById(user).then(function (data) {
                        bot.postMessageToUser(data.name, 'a private message to you', { 'slackbot': true, icon_emoji: ':cat:' });
                    });
                    break;
                case 'meteo':
                    http.get({
                        host: 'api.openweathermap.org',
                        path: '/data/2.5/weather?q=' + tokens[2] + '&appid=' + process.env.OPENWEATHER_APPID
                    }, (response) => {
                        var body = '';
                        response.on('data', function (data) {
                            body += data;
                        })
                        response.on('end', function () {
                            let weather = JSON.parse(body).weather[0];
                            bot.postMessageToChannel('general', weather.description + ' ' + emoticon(weather.main), params);
                        })

                        function emoticon(weather) {
                            switch (weather) {
                                case 'Rain':
                                    return ':rain_cloud:';
                                case 'Clear':
                                    return ':sunny:';
                                case 'Clouds':
                                    return ':cloud:';
                                default:
                                    console.log('emoticon undefined for weather: ' + weather)
                                    return ':grey_question:'
                            }
                        }
                    })
                    break;
                default:
                    console.log('command not yet implemented: ' + command);

            }
        }

    }
});

