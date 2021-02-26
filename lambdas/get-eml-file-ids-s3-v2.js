/**
 * This version of the lambda returns all S3 file identifiers
 * starting with the string ${SEQ_IDENTIFIER}. It is assumed that such files are
 * named in reverse alphabetical order starting with ZZZZZZZZZZ.
 * A different lambda handles the naming of S3 files.
 * 
 * Params:
 * @domain - header or query param e.g. moogle.cc or ramachandr.in (mandatory)
 * @folderpath - query param e.g. email/2021/02 (optional)
 * @next-token - query param indicating where to continue listing S3 objects from (optional)
 * 
 * Assumptions:
 * - all S3 objects are located in <BUCKET>/<@domain>/<@folderpath>
 * - @domain is inferred from the HTTP header. If not found in the header or the value
 * in the header is `localhost`, we look for the domain in query parameters
**/

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
const URL = require('url').URL;
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;
const SEQ_IDENTIFIER = process.env.SEQUENCE_IDENTIFIER || '___';
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS.replace(/\s/g, '').split(',');
const DELIM = "/";
const RESPONSE = {
    statusCode: 400,
    headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: 'no data',
};
let getOrigin = (event) => {
    let d = event.headers.origin || event.headers.referer;
    return (new URL(d)).origin;
};
let getDomain = (event) => {
    let d = event.headers.origin || event.headers.referer;
    let host = (new URL(d)).hostname;
    if(host === 'localhost') return event.queryStringParameters.domain;
    return host;
};

let getFolderpath = (event) => event.queryStringParameters.folderpath;
let getNextToken = (event) => event.queryStringParameters['next-token'];
let getS3Objects = async (prefix, nextToken) => {
    var listObjectsV2Params = {
        Bucket: BUCKET_NAME,
        Delimiter: DELIM,
        Prefix: prefix,
        MaxKeys: parseInt(process.env.MAX_KEYS || '100', 10),
    };
    if(nextToken) listObjectsV2Params.ContinuationToken = nextToken;
    console.log(listObjectsV2Params);
    return s3.listObjectsV2(listObjectsV2Params)
    .promise();
};

exports.handler = async (event, context, callback) => {
    console.log(event);
    const domain = getDomain(event);
    const nextToken = getNextToken(event);
    console.log(`Domain = ${domain}`);
    if(domain && ALLOWED_DOMAINS.includes(domain)){
        const folderpath = getFolderpath(event) || '';
        console.log(`Folderpath = ${folderpath}`);
        return await getS3Objects(`${domain}${folderpath}${DELIM}${SEQ_IDENTIFIER}`, nextToken)
        .then(d => {
            let x = JSON.parse(JSON.stringify(RESPONSE));
            x.statusCode = 200;
            x.headers["Access-Control-Allow-Origin"] = getOrigin(event);
            x.body = JSON.stringify({"Contents" : d.Contents, "NextToken": d.NextContinuationToken});
            return x;
        })
        .catch(e => console.log(e));
    }
    return RESPONSE;
};