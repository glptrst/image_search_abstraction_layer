module.exports = {
    'showLatestQueries': showLatestQueries,
    'createApiUrl': createApiUrl,
    'getQuery': getQuery
};

// Respond using handle with latest queries in collection
function showLatestQueries (collection, handle) {
    collection.find({}).toArray((err, docs) => {
	handle.statusCode = 200;
	handle.setHeader('Content-type', 'application/json');
	for (let i = 0; i < docs.length; i++) {
	    handle.write(docs[i]['query'] + '\n');
	}
	handle.end();
    });
}

function createApiUrl (splittedUrl, cx, api_key) {
    // Set url for http get request to google custom search
    let url = 'https://www.googleapis.com/customsearch/v1?q=' + splittedUrl[3] + '&cx=' + cx + '&searchType=image&key=' + api_key,
	// Query parameter for http get request to google custom search
	query = splittedUrl[3],
	// Get offset param if present
	offset = /\?offset=\d+/.exec(splittedUrl[3]);
    if (offset !== null) { // If offset param is present
	let offsetNum = /\d+/.exec(offset)[0];
	url = url.replace(offset[0], `?start=${offsetNum}`);
	query = query.replace(/\?offset=\d+/, '');
    }

    return url;
}

function getQuery (splittedUrl) {
    // Query parameter for http get request to google custom search
    let query = splittedUrl[3],
	// Get offset param if present
	offset = /\?offset=\d+/.exec(splittedUrl[3]);
    if (offset !== null) { // If offset param is present
	query = query.replace(/\?offset=\d+/, '');
    }

    return query;
}
