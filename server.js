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
	    // TODO
	    console.log('GET');
	} else {
	    res.statusCode = 404;
	    res.end('Wrong method');
	}
    });

    server.listen(port, () => {
	console.log('Listening at port ' + port);
    });
        
});
