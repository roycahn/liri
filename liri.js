var tk = require('./keys.js');
var Twitter = require('twitter');
var request = require('request');
var wordwrap = require('wordwrapjs');  // used to wrap text in movie plot
var spotify = require('spotify')
var fs = require("fs");
var inquirer = require("inquirer");

var whatToDo = "";
var whatToFind = "";



var client = new Twitter(tk.twitterKeys);


var options = [
    {
        type: "list",
        message: "Select an Action",
        name: "action",
        choices: [
            {
                name: "my-tweets"
            },
            {
                name: "spotify-this-song"
            },
            {
                name: "movie-this"
            },
            {
                name: "do-what-it-says"
            },
        ] //choices
    },

    {
        type: "input",
        message: "What do you want to find?",
        name: "query"

    }
];



inquirer.prompt(options).then(function (answer) {

    whatToDo = answer["action"];
    whatToFind = JSON.stringify(answer["query"])




    var twitterParams = { q: whatToFind };
    function main() {
        switch (whatToDo) {
            case "my-tweets":
                client.get('search/tweets', twitterParams, function (error, tweets, response) {
                    if (!error) {
                        var i = 0;

                        while ((typeof tweets.statuses[i]) != 'undefined') {
                            console.log("On: " + tweets.statuses[i].created_at + "\nthe tweet was: " + wordwrap.wrap(tweets.statuses[i].text, { width: 60 }) + "\n");
                            i++;
                        }
                    }
                });
                break;
            case "spotify-this-song":
                spotify.search({ type: 'track', query: whatToFind }, function (err, data) {
                    if (err) {
                        console.log('Error occurred: ' + err);
                        return;
                    }
                    var trackCount = data.tracks.items.length;

                    console.log("Found: " + trackCount + " Tracks for query: " + whatToFind + "\n");
                    for (var i = 0; i < trackCount; i++) {
                        var artistCount = data.tracks.items[i].artists.length;
                        for (var j = 0; j < artistCount; j++) {
                            console.log("Artist: " + data.tracks.items[i].artists[j].name +
                                " Album:  " + wordwrap.wrap(data.tracks.items[i].album.name, { width: 60 }) +
                                " Link: " + data.tracks.items[i].artists[j].external_urls.spotify + "\n");
                        }
                    }

                });

                break;
            case "movie-this":
                if (whatToFind === "") {
                    input[3] = "Mr. Nobody"
                }
                var queryUrl = "http://www.omdbapi.com/?t=" + whatToFind + "&y=&plot=short&r=json&tomatoes=true";

                request(queryUrl, function (error, response, body) {


                    if (!error && response.statusCode === 200) {
                        var title = JSON.parse(body).Title;
                        var year = JSON.parse(body).Year;
                        var rated = JSON.parse(body).Rated;
                        var country = JSON.parse(body).Country;
                        var language = JSON.parse(body).Language;
                        var plot = JSON.parse(body).Plot;
                        var actors = JSON.parse(body).Actors;
                        var tomatoes = JSON.parse(body).tomatoUserRating;
                        var tomatoesurl = JSON.parse(body).tomatoURL;

                        var plotWrapped = wordwrap.wrap(plot, { width: 60 });

                        console.log('\nMovie Title: ' + title + '\n\n' +
                            'Year Released: ' + year + '\n\n' +
                            'IMDB Rating: ' + rated + '\n\n' +
                            'Country where the movie was produced: ' + country + '\n\n' +
                            'Language: ' + language + '\n\n' +
                            'Plot:\n' + plotWrapped + '\n\n' +
                            'Actors: ' + actors + '\n\n' +
                            'Tomatoes: ' + tomatoes + ' Tomatoes url: ' + tomatoesurl + '\n'
                        );
                    }
                });
                break;
            case "do-what-it-says":
                //setTiemout zero to guarantee asynch
                setTimeout(fs.readFile('random.txt', 'utf8', function (err, data) {
                    if (err) throw err;
                    data = data.split(",");
                    whatToDo = data[0];
                    whatToFind = data[1];

                    //call main with the parameters read from random.txt
                    main();

                }) //readfile 
                    , 0)//setTimeout
        } //switch

    } //main
    main()
});//inquirer.prompt








