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

const ALLOWED_KEYS = process.env.ALLOWED_KEYS;
const ALLOWED_RESOURCES = process.env.EXTENDED_RESOURCES.replace(' ', '').split(',');
exports.handler = async (event, context, callback) => {
    console.log(event);
    let extendedData = false;
    if(event.resource && ALLOWED_RESOURCES.includes(event.resource)){
        extendedData = true;
    }
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
    
    // allow reads only if headers.Origin or referer is set and is not `localhost`
    if((event.headers.origin || event.headers.referrer) && getHostnameFromUrl(event.headers.origin || event.headers.referer) !== 'localhost'){
        params.domain = getHostFromUrl(event.headers.origin || event.headers.referrer);
    }
    //and belongs to the list of allowed domains
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
            x.headers['Access-Control-Allow-Origin'] = event.headers.origin || event.headers.referrer;
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
            if(!extendedData){
                x.body = {};
                x.body.attachments = [];
                ALLOWED_KEYS.split(",").map(key => {
                    x.body[key] = y[key];
                });
                x.body = JSON.stringify(x.body);
            }
            return x;
        })
        .catch(e => {
            console.log(e);
            return RESPONSE;
        });
    }
};