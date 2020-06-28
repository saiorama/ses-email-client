var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME;
var OLD_KEY;
var NEW_KEY; 
var DELIM = "/";
exports.handler = async (event, context, callback) => {
    console.log(event);
    var Records = event.Records;
    OLD_KEY = Records[0].s3.object.key;
    let filename = OLD_KEY;
    let filepath = '';
    let parts = OLD_KEY.split(DELIM);
    if(parts.length > 1) {
        filename = parts[parts.length - 1];
        for(let i = 0; i < parts.length - 1; i++){
            filepath += parts[i] + DELIM;
        }
    }
    BUCKET_NAME = Records[0].s3.bucket.name;
    let date = new Date();
    let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    let prefix = `${date.getFullYear()}-${month}-${date.getDate()}`;
    NEW_KEY = `${filepath}${prefix}-${date.getTime()}-${filename}`;
    console.log(BUCKET_NAME);
    console.log(NEW_KEY);
    // TODO implement
    let response = {
        statusCode: 200,
        // body: JSON.stringify(''),
    };

    await s3.copyObject({
        Bucket: `${BUCKET_NAME}`,
        CopySource: `${BUCKET_NAME}/${OLD_KEY}`, 
        Key: `${NEW_KEY}`
    }).promise()
    .then(() =>{
        // Delete the old object
        console.log('File was copied');
        response.body = JSON.stringify('File was copied');
    })
    .then(async () => {
        console.log('Deleting old file');
        return s3.deleteObject({
          Bucket: BUCKET_NAME, 
          Key: OLD_KEY
        }).promise();
    })
    .then(() => {
        console.log('File was renamed');
        response.body = JSON.stringify('File was renamed');
    })
    // Error handling is left up to reader
    .catch((e) => {
        console.error(e);
        response.statusCode = 400;
        response.body = JSON.stringify('File was not renamed');
    });
    return response;
};
