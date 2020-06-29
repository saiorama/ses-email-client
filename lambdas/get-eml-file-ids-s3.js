/**
 * Lambda returns a list of email files names received "today".
 * 1. Since we use UTC time to determine the list of file names
 *    to be returned, this lambda returns emails returned "today"
 *    and "yesterday"
 * 2. The implementation assumes that email file names are prefixed
 *    as `yyyy-mm-dd-unix_timestamp-`
**/

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME = "mx.sairamachandr.in";
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env[`ALLOWED_DOMAINS`].split(","): ["zeer0.com"];
const DELIM = "/";

const RESPONSE = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: 'no data',
};

let getS3Objects = async (prefix) => {
    var listObjectsV2Params = {
        Bucket: BUCKET_NAME,
        Delimiter: DELIM,
        Prefix: prefix
    };
    console.log(listObjectsV2Params);
    return await s3.listObjectsV2(listObjectsV2Params)
    .promise()
    .then(d => d)
    .catch(e => console.log(e));
};

// returns UTC date in yyyy-mm-dd format.
// mm is human friendly so Jan would be returned as 01, June as 06, and December as 12
// @offsetFromToday: returns `$today +/- $offsetFromToday``
let calculateDatePrefix = (offsetFromToday) => {
    let date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    let monthHumanFriendly = date.getMonth() + 1;
    monthHumanFriendly = monthHumanFriendly < 10 ? `0${monthHumanFriendly}` : `${monthHumanFriendly}`;
    return `${date.getUTCFullYear()}-${monthHumanFriendly}-${date.getDate()}`;
};

// returns a single object containing emails received yesterday and today
exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
    if(params.domain && ALLOWED_DOMAINS.includes(params.domain)){
        let todayPrefix = `${calculateDatePrefix(0)}`;
        let yestPrefix = `${calculateDatePrefix(-1)}`;
        let p1 = await getS3Objects(`${params.domain}${DELIM}${todayPrefix}`);
        let p2 = await getS3Objects(`${params.domain}${DELIM}${yestPrefix}`);
        
        let emailList = Object.assign({}, p1);
        // caller might want to review which prefixes were used
        emailList.Prefix = [emailList.Prefix, p2.Prefix];
        // combining email file names from yesterday and today
        emailList.Contents = [...emailList.Contents, ...p2.Contents];
        
        let x = JSON.parse(JSON.stringify(RESPONSE));
        x.body = JSON.stringify(emailList);
        return x;
    }
    
    return RESPONSE;
};