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
    const server = http.createServer((req, res) => {
	req.on('error', (err) => {
	    console.log(err);
	    res.statusCode = 400;
	    res.end();
	});

	if (req.method === 'GET') {
	    console.log(`Received get request: ${req.url}`);

	    if (req.url === '/') {
		// Serve homepage
		fs.readFile('./public/index.html', (err, fileContent) => {
		    if (err) {
			console.log('Error 1');
		    } else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(fileContent);
		    }
		});
	    } else {
		let splittedUrl = req.url.split('/');
		if (splittedUrl[1] === 'api' && splittedUrl[2] === 'latest' && splittedUrl[3] === 'imagesearch') {
		    // Show latest image searchs
		    collection.find({}).toArray((err, docs) => {
			res.statusCode = 200;
			res.setHeader('Content-type', 'application/json');
			for (let i = 0; i < docs.length; i++) {
			    res.write(docs[i]['query'] + '\n');
			}
			res.end();
		    });
		} else if (splittedUrl[1] === 'api' && splittedUrl[2] === 'imagesearch') {
		    // Set url for http get request to google custom search
		    let url = 'https://www.googleapis.com/customsearch/v1?q=' + splittedUrl[3] + '&cx=' + process.env.CX + '&searchType=image&key=' + process.env.API_KEY,
			// Query parameter for http get request to google custom search
			query = splittedUrl[3],
			// Get offset param if present
			offset = /\?offset=\d+/.exec(splittedUrl[3]);
		    if (offset !== null) { // If offset param is present
			let offsetNum = /\d+/.exec(offset)[0];
			url = url.replace(offset[0], `?start=${offsetNum}`);
			query = query.replace(/\?offset=\d+/, '');
		    }

		    https.get(url, (response) => {
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
				// Show fetched data to the user
				res.statusCode = 200;
				res.setHeader('Content-type', 'text/html');
				const items = JSON.parse(rawData).items;
				// Check if the api actually gave us something
				if (items !== undefined) {
				    for (let i = 0; i < items.length; i++) {
					res.write('<a href="' +items[i].link + '">Photo ' + i + '</a> </br>');
				    }
				    res.end();
				    //Check of number of docs in the db before inserting the query
				    collection.find({}).count((err, numberOfDocs) => {
					if (numberOfDocs < 999) {
					    // Insert query in db
					    const userQuery = {
						"query": query,
						"time": new Date().getTime()
					    };
					    collection.insertOne(userQuery, function(err, result){
						if (err) {
						    console.log(err);
						} else {
						    console.log('Request stored in db');
						}
					    });	    
					} else {
					    console.log('Cannot store request. DB full.');
					}
				    });
				} else {
				    res.end('No image found :(');
				}
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
	    }
	} else { // If method is not GET
	    res.statusCode = 404;
	    res.end('Wrong method');
	}
    });

    server.listen(port, () => {
	console.log('Listening at port ' + port);
    });
});
