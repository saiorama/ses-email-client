//call this lambda from the other lambda
//you get the S3 email file name with bucket and prefix
//extract attachments using mailparser
//write the exact attachment id to s3 under <bucket>/<prefix>/attachments/attachment-id/attachment-name

var AWS = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
var URL = require('url').URL;

AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME = process.env.BUCKET_NAME;
var EMAIL_ATTACHMENTS_FOLDER_KEY = process.env.EMAIL_ATTACHMENTS_FOLDER_KEY;
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env[`ALLOWED_DOMAINS`].split(","): ["zeer0.com"];
const DELIM = '/';

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

let getAWSSNSRecordFromEvent = (event) => event.Records ? event.Records.find(r => r.EventSource === 'aws:sns') : undefined;

let getKeyPrefixFromKey = (key) => key.split(DELIM).slice(0, -1).join(DELIM);
let getEmlFilenameFromKey = (key) => key.split(DELIM).pop();
let getKeyForAttachments = (key, filename) => `${getKeyPrefixFromKey(key)}${DELIM}${process.env.EMAIL_ATTACHMENTS_FOLDER_KEY}${DELIM}${getEmlFilenameFromKey(key)}${DELIM}${filename}`;

let putEmlAttachmentObject = (bucket, key, buffer, contentType) => {
  const params = {
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Tagging: "public=yes",
    };  
    return s3.putObject(params).promise();
};

exports.handler = async (event, context, callback) => {
    console.log(JSON.stringify(event));
    let awsSnsRecord = getAWSSNSRecordFromEvent(event);
    if(awsSnsRecord && awsSnsRecord.Sns && awsSnsRecord.Sns.Message){
        let emlDetails = JSON.parse(awsSnsRecord.Sns.Message);
        return await s3.getObject(emlDetails).promise()
        .then(async data => {
            let emlBody = data.Body.toString('ascii');
            return await processEml(emlBody);
        })
        .then(d => {
            return Promise.all(d.attachments.map((a) => {
                if(a.contentDisposition === 'attachment'){
                    return putEmlAttachmentObject(emlDetails.Bucket, getKeyForAttachments(emlDetails.Key, a.filename), a.content, a.contentType)
                        .then(d => d);   
                }
            }));
        })
        .then(vals => console.log(JSON.stringify(vals)))
        .catch(e => {
            console.log(e);
            return RESPONSE;
        });
    }
};