var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME = "example_bucker";
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env[`ALLOWED_DOMAINS`].split(","): ["example.com"];
const DELIM = "/";

const RESPONSE = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: 'no data',
};

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
    if(params.domain && ALLOWED_DOMAINS.includes(params.domain)){
        let date = new Date();
        let monthHumanFriendly = date.getMonth() + 1;
        monthHumanFriendly = monthHumanFriendly < 10 ? `0${monthHumanFriendly}` : `${monthHumanFriendly}`;
        let prefix = `${date.getUTCFullYear()}-${monthHumanFriendly}-${date.getDate()}`;
        var listObjectsV2Params = {
            Bucket: BUCKET_NAME,
            Delimiter: DELIM,
            Prefix: `${params.domain}${DELIM}${prefix}`
        };
        console.log(listObjectsV2Params);
        return await s3.listObjectsV2(listObjectsV2Params)
        .promise()
        .then(d => {
            let x = JSON.parse(JSON.stringify(RESPONSE));
            x.body = JSON.stringify(d);
            return x;
        })
        .catch(e => console.log(e));
    }
    
    return RESPONSE;
};