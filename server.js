"use strict";
const http = require('http');
const https = require('https');
const fs = require('fs');
const mongodb = require('mongodb');

const port = process.env.PORT || 3000;

mongodb.MongoClient.connect(process.env.DBURI, (err, client) => {
    
    if (err) {
	console.log(err);
    }

    var collection = client.db(process.env.DBNAME).collection('usersRequests');

    console.log('connected to db');

    const server = http.createServer((req, res) => {
	req.on('error', (err) => {
	    console.log(err);
	    res.statusCode = 400;
	    res.end();
	});

	if (req.method === 'GET') {
	    let splittedUrl = req.url.split('/');
	    
	    console.log(splittedUrl);

	    if (splittedUrl[1] === 'api' && splittedUrl[2] === 'latest' && splittedUrl[3] === 'imagesearch') {
		// TODO
		// show recent queries
	    } else if (splittedUrl[1] === 'api' && splittedUrl[2] === 'imagesearch') {

		var query = splittedUrl[3];
		// TODO: handle offset parameter

		//sample request
		var url = 'https://www.googleapis.com/customsearch/v1?q=' + query + '&cx=' + process.env.CX + '&searchType=image&key=' + process.env.API_KEY;
		
		https.get(url,(response) => {
		    const { statusCode } = response;
		    const contentType = response.headers['content-type'];

		    let error;
		    if (statusCode !== 200) {
			error = new Error('Request Failed.\n' +
					  `Status Code: ${statusCode}`);
		    }

		    let rawData = '';
		    response.on('data', (chunk) => {
			rawData += chunk;
		    });
		    response.on('end', () => {
			try {
			    // console.log(JSON.parse(rawData));
			    // Show fetched data to the user
			    res.statusCode = 200;
			    res.setHeader('Content-type', 'application/json');
			    res.end(rawData);

			    // Insert query in db
			    const userQuery = {
				"query": query,
				"time": new Date().getTime()
			    };
			    collection.insertOne(userQuery, function(err, result){
				if (err) {
				    console.log(err);
				}
				else {
				    console.log('Request stored in db');
				}
			    });
			} catch (e) {
			    console.error(e.message);
			}
		    });
		}).on('error', (e) => {
		    console.error(`Got error: ${e.message}`);
		});
	    } else {
		res.statusCode = 404;
		res.end('Something wrong with your query');
	    }
	} else {
	    res.statusCode = 404;
	    res.end('Wrong method');
	}
    });

    server.listen(port, () => {
	console.log('Listening at port ' + port);
    });
    
});
