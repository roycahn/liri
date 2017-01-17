var tk = require('./keys.js');
var Twitter = require('twitter');
var request = require('request');
var wordwrap = require('wordwrapjs');  // used to wrap text in movie plot
var spotify = require('spotify')
var fs = require("fs");
var exec = require("exec");

var input = process.argv;

//input[2] = "do-what-it-says";
//input[3] = "Take a walk on the wild side";

var client = new Twitter(tk.twitterKeys);
var twitterParams = {q: input[3]};


switch(input[2]) {
    case "my-tweets":    	
        client.get('search/tweets', twitterParams, function(error, tweets, response) {
            if (!error) {
                var i=0;
                
                while ( (typeof tweets.statuses[i]) != 'undefined') {
                    console.log("On: " + tweets.statuses[i].created_at + " the tweet was: " + tweets.statuses[i].text );
                    i++;
                }
            }
        });
        break;
    case "spotify-this-song": 
        spotify.search({ type: 'track', query: input[3] }, function(err, data) {
            if ( err ) {
            console.log('Error occurred: ' + err);
            return;
    }
        var trackCount = data.tracks.items.length;
        
        console.log("Found: " +trackCount+  " Tracks for query: "+input[3]+ "\n" );
        for (var i=0; i<trackCount; i++){
            var artistCount = data.tracks.items[i].artists.length;
             for (var j=0; j<artistCount; j++){
                 console.log("Artist: " +data.tracks.items[i].artists[j].name+
                             " Album:  "+data.tracks.items[i].album.name+
                             " Link: "+data.tracks.items[i].artists[j].external_urls.spotify+"\n");
             }
        }

});

        break;
    case "movie-this":
        if ( input[3]===""){
            input[3] = "Mr. Nobody"
        }
        var queryUrl = "http://www.omdbapi.com/?t=" + input[3] + "&y=&plot=short&r=json&tomatoes=true";

        request(queryUrl, function(error, response, body) {

 
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
           
            var plotWrapped = wordwrap.wrap(plot, {width:60});

            console.log('\nMovie Title: '+title+ '\n\n' + 
             'Year Released: '+year+  '\n\n' + 
             'IMDB Rating: '+rated+ '\n\n' +  
             'Country where the movie was produced: '+country+'\n\n' +  
             'Language: '+language+ '\n\n' +  
             'Plot:\n'+plotWrapped+ '\n\n' +  
             'Actors: '+actors+ '\n\n' +  
             'Tomatoes: '+tomatoes+' Tomatoes url: '+tomatoesurl+ '\n' 
              );
            }
        });
        break;

    case "do-what-it-says":
        fs.readFile('random.txt', 'utf8', function(err, data) {
        data = data.replace(",", " ");

        exec(['node ./liri', data], function(err, out, code) {
            if (err instanceof Error){
                throw err;
            process.stderr.write(err);
            process.stdout.write(out);
            process.exit(code);
            }
        }); //exec

    }) //readfile

        break;
}