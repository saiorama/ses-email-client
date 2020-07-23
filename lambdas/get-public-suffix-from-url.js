let z = require('zeer0-repo');
exports.handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event));
    let domain = event.queryStringParameters.domain;
    return await z.getTldOfDomain(domain)
        .then(bestMatch => {
            const response = {
                statusCode: 400,
                body: JSON.stringify({tld: ''}),
                headers: {
                    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                    'Access-Control-Allow-Credentials': true
                },
            };
            if(bestMatch){
                response.statusCode = 200;
                response.body = bestMatch;
            }
            return response;
        });
};
