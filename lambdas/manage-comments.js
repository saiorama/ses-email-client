const AWS = require('aws-sdk');
const crypto = require('crypto');
const moment = require('moment');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3({signatureVersion: 'v4'});
//HTTP verb must be POST
//POST body should supply all the fields in COMMENT_BODY_FIELDS

exports.handler = async (event) => {
    console.log(event);
    console.log(`checking event validity`);
    if(eventIsValid(event)){
        switch (event.httpMethod.toUpperCase()){
            case 'POST':
                let body = JSON.parse(event.body);
                return await writeCommentToS3(body)
                .then(r => {
                    if(r) console.log(r);
                    return {
                         statusCode: r ? 200 : 400,
                         body: JSON.stringify({msg: (`comment ${r ? 'saved' : 'ignored'}`)})
                    };
                })
                .catch(e => {
                    console.log(e);
                    return response;
                });
            case 'GET':
              let s3Filename = event.queryStringParameters.short_link;
              let commentsPrefix = `r/${s3Filename}/comments/`;
              console.log(`comment prefix = ${commentsPrefix}`);
              return await listS3Files(REDIRECT_FILES_LOCATION, commentsPrefix)
              .then(async comments => {
                  if(comments){
                      return await Promise.all(comments.Contents.map(comment => {
                        return getS3File(REDIRECT_FILES_LOCATION, comment.Key);
                      }));
                  }
                  return ["no comments"];
              })
              .then(comments => {
                    return {
                         statusCode: 200,
                         body: JSON.stringify({'comments': comments}) 
                    };
              })
              .catch(e => {
                  console.log(e);
                  return {
                      statusCode: 400,
                      body: JSON.stringify({msg: 'error'})
                  };
              });
        }
    }
    console.log(`Event is invalid`);
    return response;
};

let writeCommentToS3 = async (body) => {
    if(body.short_link && body.thread_identifier){
        let s3Filename = body.short_link;
        let pageIdFilename = `r/${s3Filename}/${PAGE_ID_PREFIX}-${body.thread_identifier}`;
        //There should be a file inside the S3 bucket with the 
        //same prefix as PAGE_ID_PREFIX-thread_identifier
        return await listS3Files(REDIRECT_FILES_LOCATION, pageIdFilename)
        .then(async fileList => {
            //write comment only if thread_identifier matches sha256
            if(fileList.Contents.length > 0){
                let comment_id = getS3FileDatePrefix(undefined, undefined, true);
                body.comment_id = comment_id;
                return await s3.putObject({
                    Bucket: REDIRECT_FILES_LOCATION,
                    Key: `r/${s3Filename}/comments/${comment_id}.json`,
                    Body: JSON.stringify(body),
                    ContentType: `application/json`})
                    .promise();
            }
        })
        .then (d => d)
        .catch(e => console.log(e));
    }
};

const REDIRECT_FILES_LOCATION = process.env.REDIRECT_FILES_LOCATION;
const PAGE_ID_PREFIX = process.env.PAGE_ID_PREFIX;
const COMMENT_BODY_FIELDS = [
'thread_identifier', //this value should match sha256(`short_link`-`page_url`)
'comment_id', //'NEW' or <existing-id>
'update_type', //'NEW' | 'DELETE'
'short_link',
'page_url',
'commenter_name',
'commenter_id',
'commented_at',
'html_part',
'text_part'];

let getS3FileDatePrefix = (date, format, withTimestamp) => {
    let ts = date ? date.getTime() : Date.now();
    return `${moment(ts).format(format ? format : 'YYYY-MM-DD')}` + 
    `${withTimestamp ? ts * -1 : ''}`;
};

let listS3Files = async (bucket, fileKeyOrPrefix) => {
    var params = {
      Bucket: bucket, 
      Prefix: fileKeyOrPrefix
    };
    return s3.listObjectsV2(params).promise();
};

let getS3File = async (bucket, key) => {
    let getParams = {
      Bucket: bucket,
      Key: key
    };
    return await s3.getObject(getParams)
    .promise()
    .then(async data => {
      return data.Body.toString('ascii');
    });
};

const response = {
    statusCode: 400,
    body: JSON.stringify({msg: 'invalid request'})
};

let getStringHash = (str, algo, format) => {
    return crypto.createHash(algo || 'sha256')
    .update(str)
    .digest(format || 'hex');
};

let eventIsValid = (event) => {
    if(event.httpMethod){
        switch(event.httpMethod.toUpperCase()){
            case 'POST':
                console.log(`http method ${event.httpMethod} is valid`);
                if(!event.body) return false;
                console.log('body was found');
                let body = JSON.parse(event.body);
                let notInBody = COMMENT_BODY_FIELDS.find(f => !Object.keys(body).includes(f));
                if(!notInBody){
                    console.log('found all required fields');
                    let x = getStringHash(`${body.short_link}-${body.page_url}`);
                    console.log(`String hash = ${x}, thread_id = ${body.thread_identifier}`);
                    return x === body.thread_identifier;
                }
                console.log(`missing required fields ${notInBody}`);
                return false;
            case 'GET':
                console.log(`http method ${event.httpMethod} is valid`);
                return event.queryStringParameters &&
                  event.queryStringParameters.short_link;
            default:
                console.log(`http method ${event.httpMethod} is NOT valid`);
                return false;
        }
    }
    return false;
};