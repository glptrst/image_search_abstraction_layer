"use strict";
const http = require('http');
const https = require('https');
const fs = require('fs');
const mongodb = require('mongodb');

// Require config variables values (DBURI, DBNAME, CX, API_KEY)
var config = require('./config');

const port = process.env.PORT || 3000;

const imageSearch = require('./imageSearch');

mongodb.MongoClient.connect(config.DBURI, (err, client) => {
    if (err) {
	console.log(err);
    }
    var collection = client.db(config.DBNAME).collection('usersRequests');
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
		    imageSearch.showLatestQueries(collection, res);
		} else if (splittedUrl[1] === 'api' && splittedUrl[2] === 'imagesearch') {
		    https.get(imageSearch.createApiUrl(splittedUrl, config.CX, config.API_KEY), (response) => {
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
					if (numberOfDocs < 20) {
					    // Insert query in db
					    const userQuery = {
						"query": imageSearch.getQuery(splittedUrl),
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
					    collection.find({}).toArray(function (err, docs) {
						if (err) {
						    console.log(err);
						} else {
						    let lastDocId = docs[0]['_id'];
						    collection.deleteOne({ '_id' : lastDocId }, function(err, result) {
							if (err) {
							    console.log(err);
							} else {
							    console.log('Last doc deleted');
							    // Insert query in db
							    const userQuery = {
								"query": imageSearch.getQuery(splittedUrl),
								"time": new Date().getTime()
							    };
							    collection.insertOne(userQuery, function(err, result){
								if (err) {
								    console.log(err);
								} else {
								    console.log('Request stored in db');
								}
							    });	    
							}
						    });
						}
					    });
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
