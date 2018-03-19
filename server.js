"use strict";
const http = require('http');
const fs = require('fs');
const mongodb = require('mongodb');

const port = process.env.PORT || 3000;

mongodb.MongoClient.connect(process.env.DBURI, (err, client) => {
    
    if (err) {
	console.log(err);
    }

    var collection = client.db(process.env.DBNAME).collection('usersRequests');

    console.log('connected to db');
        
});
