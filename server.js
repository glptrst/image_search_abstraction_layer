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

	    //sample request
	    var query = 'sky';
	    https.get('https://www.googleapis.com/customsearch/v1?q=' + query + '&cx=' + process.env.CX + '&searchType=image&key=' + process.env.API_KEY,(res) => {
		const { statusCode } = res;
		const contentType = res.headers['content-type'];

		let error;
		if (statusCode !== 200) {
		    error = new Error('Request Failed.\n' +
				      `Status Code: ${statusCode}`);
		}

		let rawData = '';
		res.on('data', (chunk) => {
		    rawData += chunk;
		});
		res.on('end', () => {
		    try {
			console.log(JSON.parse(rawData));
		    } catch (e) {
			console.error(e.message);
		    }
		});
	    }).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	    });

	    
	} else {
	    res.statusCode = 404;
	    res.end('Wrong method');
	}
    });

    server.listen(port, () => {
	console.log('Listening at port ' + port);
    });
    
});
