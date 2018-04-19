if (process.env.HEROKU !== 'true')
{
    // Require config variables values (DBURI, DBNAME, CX, API_KEY)
    var configVariables = require('./configVariables');
}

module.exports = {
    DBURI: process.env.DBURI || configVariables.db.DBURI,
    DBNAME: process.env.DBNAME || configVariables.db.DBNAME,
    CX: process.env.CX || configVariables.googleApi.CX,
    API_KEY: process.env.API_KEY || configVariables.googleApi.API_KEY
};
