var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3({signatureVersion: 'v4'});
var sns = new AWS.SNS({apiVersion: '2010-03-31', region: 'ap-south-1'});
var REDIRECT_FILES_LOCATION = `moogle.cc`;

var BUCKET_NAME;
var OLD_KEY; //= '/chicshop/013j1dmq7vd3d9ohj9660oo46rbo3i84jno64n01';
var NEW_KEY; // = '/chicshop/013j1dmq7vd3d9ohj9660oo46rbo3i84jno64n01.eml';
var DELIM = "/";
const REDIRECT_URL_LEN = 8;
let getRandomStringOfLength = (len) => Math.random().toString(16).substr(2, 2+len);
let getRedirectUrl = (domain, str) => `https://${REDIRECT_FILES_LOCATION}/r/${str}`;
let getEmailUrl = (domain, emailId) => `https://${domain}/email/get.html?emailId=${emailId}`;
let addRedirect = async (s3Filename, redirectUrl) => {
    let htmlContent = `<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Refresh" content="0; url='${redirectUrl}'" />
  </head>
  <body>
  </body>
</html>
`;
    console.log(`Adding redirect to ${redirectUrl} to ${REDIRECT_FILES_LOCATION}`);
    return await s3.putObject({
        Bucket: REDIRECT_FILES_LOCATION,
        Key: `r/${s3Filename}`,
        Body: htmlContent,
        ContentType: `text/html`})
    .promise();
};

// only rename email files at the top level folder
// i.e. if a file resides at mx.sairamachandr.in/zeer0.com/ABC/dflvdkvfsflvvsgfgbfgb
// it should not be renamed.
let s3ObjectMustBeRenamed = (key) => {
    return key.split(DELIM).length === 2;
};

exports.handler = async (event, context, callback) => {
    console.log(JSON.stringify(event));
    
    var Records = event.Records;
    OLD_KEY = Records[0].s3.object.key;
    let response = {
        statusCode: 200,
        body: 'Rename request was received',
    };
    console.log(response.body);
    if(s3ObjectMustBeRenamed(OLD_KEY)){
        let filename = OLD_KEY.split(DELIM).pop();
        let filepath = OLD_KEY.split(DELIM).slice(0, -1).join(DELIM);
        
        BUCKET_NAME = Records[0].s3.bucket.name;
        let date = new Date();
        let month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        let prefix = `${date.getFullYear()}-${month}-${date.getDate()}`;
        NEW_KEY = `${filepath}${DELIM}${prefix}-${date.getTime()}-${filename}`;
        console.log(BUCKET_NAME);
        let domain = NEW_KEY.split(DELIM)[0];
        let redirectFilename = getRandomStringOfLength(REDIRECT_URL_LEN);
        console.log(NEW_KEY);
        await s3.copyObject({
            Bucket: `${BUCKET_NAME}`,
            CopySource: `${BUCKET_NAME}/${OLD_KEY}`, 
            Key: `${NEW_KEY}`
        }).promise()
        .then(() =>{
            // Delete the old object
            response.body = JSON.stringify('File was copied');
            console.log(response.body);
        })
        .then(async () => {
            console.log('Deleting old file');
            return s3.deleteObject({
              Bucket: BUCKET_NAME, 
              Key: OLD_KEY
            }).promise();
        })
        .then(() => {
            response.body = JSON.stringify('File was renamed');
            console.log(response.body);
        })
        .then(async () => {
            return addRedirect(redirectFilename, getEmailUrl(domain, NEW_KEY.split(DELIM)[1]));
        })
        .then(async () => {
            var params = {
                Message: JSON.stringify({
                    Bucket: `${BUCKET_NAME}`,
                    Key: `${NEW_KEY}`,
                    RedirectUrl: getRedirectUrl(domain, redirectFilename)
                }),
                Subject: 'ERN-Email renamed',
                TopicArn: `${process.env['EMAIL_SNS_TOPIC_ARN']}`
            };
            return await sns.publish(params).promise();
        })
        .then(d => console.log(d))
        // Error handling is left up to reader
        .catch((e) => {
            console.error(e);
            response.statusCode = 400;
            response.body = JSON.stringify('File was not renamed');
            console.log(response.body);
        });
        return response;
    }
    response.body = 'File will not be renamed';
    console.log(response.body);
    return response;
};
