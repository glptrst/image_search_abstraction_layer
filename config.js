if (process.env.HEROKU !== 'true')
{
    // Require config variables values (DBURI, DBNAME, CX, API_KEY)
    var configVariables = require('./configVariables');
}

module.exports = {
    DBURI: process.env.DBURI || configVariables.DBURI,
    DBNAME: process.env.DBNAME || configVariables.DBNAME,
    CX: process.env.CX || configVariables.CX,
    API_KEY: process.env.API_KEY || configVariables.API_KEY
};
