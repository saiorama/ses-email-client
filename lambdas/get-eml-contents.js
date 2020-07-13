var AWS = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
var URL = require('url').URL;

AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME = process.env.BUCKET_NAME;
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env[`ALLOWED_DOMAINS`].split(","): ["zeer0.com"];
const EMAIL_ATTACHMENTS_FOLDER_KEY = process.env.EMAIL_ATTACHMENTS_FOLDER_KEY;
const DELIM ='/';
let processEml = async (emlBody) => {
    return simpleParser(emlBody)
      .then( d => d);
};

const RESPONSE = {
    statusCode: 400,
    headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({'msg': 'no data'}),
};

let getHostnameFromUrl = (url) => {
    return (new URL(url)).hostname;
};

let getHostFromUrl = (url) => {
    return (new URL(url)).host;
};

let getKeyPrefixFromKey = (key) => key.split(DELIM).slice(0, -1).join(DELIM);
let getEmlFilenameFromKey = (key) => key.split(DELIM).pop();
let getKeyForAttachments = (key, filename) => `${getKeyPrefixFromKey(key)}${DELIM}${process.env.EMAIL_ATTACHMENTS_FOLDER_KEY}${DELIM}${getEmlFilenameFromKey(key)}${DELIM}${filename}`;

let attachmentsMetadata = (bucket, key, attachments) => {
    return attachments.map(a => {
        let x = Object.assign({}, a);
        delete(x.content);
        x.contentLocation = `https://s3.amazonaws.com/${BUCKET_NAME}${DELIM}${getKeyForAttachments(key, a.filename)}`;
        return x;
    });
};

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
    
    // don't allow web based clients to read emails from any domain other than localhost
    // allow curl-type clients to query random domains by including domain=xyz in querystring
    if((event.headers.origin || event.headers.referrer) && getHostnameFromUrl(event.headers.origin || event.headers.referer) !== 'localhost'){
        params.domain = getHostFromUrl(event.headers.origin || event.headers.referrer);
    }
    if(params.domain && ALLOWED_DOMAINS.includes(params.domain) && params.id){
        var getParams = {
            Bucket: BUCKET_NAME,
            Key: `${params.domain}/${params.id}`
        };
        return await s3.getObject(getParams)
        .promise()
        .then(async data => {
            let emlBody = data.Body.toString('ascii');
            return await processEml(emlBody);
        })
        .then(d => {
            let x = JSON.parse(JSON.stringify(RESPONSE));
            x.statusCode = 200;
            let y = JSON.parse(JSON.stringify(d));
            y.headers = {};
            for(let [key, value] of d.headers) {
              y.headers[key] = value;
            }
            y.attachments = attachmentsMetadata(BUCKET_NAME, `${params.domain}/${params.id}`, y.attachments);
            x.body = JSON.stringify(y);
            if(params.type && d[params.type.toLowerCase()]){
                let y = {headers: d.headers};
                y[params.type] = d[params.type.toLowerCase()];
                x.body = JSON.stringify(y);
                if(params.format && params.format.toLowerCase() === 'raw'){
                    x.body = d[params.type.toLowerCase()];
                } 
            }
            return x;
        })
        .catch(e => {
            console.log(e);
            return RESPONSE;
        });
    }
};