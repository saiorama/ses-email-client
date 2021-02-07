var AWS = require('aws-sdk');
const URL = require('url').URL;
const axios = require('axios');
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3({signatureVersion: 'v4'});
const DELIM = '/';
const BOOKMARKS_EMAIL_PREFIX = process.env.BOOKMARKS_EMAIL_PREFIX;
const FROM_EMAIL_PREFIX = process.env.FROM_EMAIL_PREFIX;
const REPLY_TO_EMAIL_PREFIX = process.env.REPLY_TO_EMAIL_PREFIX;
const TEMPLATE_NAME = process.env.TEMPLATE_NAME;

let getAWSSNSRecordFromEvent = (event) => event.Records ? event.Records.find(r => r.EventSource === 'aws:sns') : undefined;
let getKeyPrefixFromKey = (key) => key.split(DELIM).slice(0, -1).join(DELIM);
let getEmlFilenameFromKey = (key) => key.split(DELIM).pop();
let addressListHasBookmarksEmail = (addressList, bookmarksEmail) => {
    if(addressList && addressList.value){
        let x = addressList.value.find(a => {
            return a.address.toLowerCase().startsWith(bookmarksEmail.toLowerCase());
        });
        return x ? true : false;   
    }
    return false;
};
let flattenAddressList = (emailContent, type) => {
    let addressList = emailContent[type];
    if(addressList && addressList.value){
        return addressList.value.map(a => a.address.toLowerCase());
    }
    return undefined;
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
let writeTemplatedIndexFile = async(bucket, key, shortlink, emlId, emlSubj, from) => {
    return await getS3File(process.env.TEMPLATED_INDEX_FILE_BUCKET,
        process.env.TEMPLATED_INDEX_FILE_KEY)
    .then(templatedContent => {
        return templatedContent.replace('{{#MAIL-TITLE#}}', emlSubj)
          .replace('{{#MAIL-DESCRIPTION#}}', `${from} has invited you to Moogle this email`)
          .replace('{{#SHORT-LINK#}}', shortlink)
          .replace('{{#PAGE-ID#}}', emlId);
    })
    .then(async indexBody =>{
        return await s3.putObject({
          Bucket: bucket,
          Key: key,
          Body: indexBody,
          ContentType: `text/html`})
        .promise();
    })
    .catch(e => console.log(e));
};
exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    let awsSnsRecord = getAWSSNSRecordFromEvent(event);
    if(awsSnsRecord && awsSnsRecord.Sns && awsSnsRecord.Sns.Message){
        let emlDetails = JSON.parse(awsSnsRecord.Sns.Message);
        if(emlDetails.RedirectUrl){
            let domain = getKeyPrefixFromKey(emlDetails.Key);
            let bookmarksEmail = `${BOOKMARKS_EMAIL_PREFIX.toLowerCase()}${domain}`;
            let fromEmail = `${FROM_EMAIL_PREFIX.toLowerCase()}${domain}>`;
            let emailId = getEmlFilenameFromKey(emlDetails.Key);
            let emailHereLink = emlDetails.RedirectUrl;
            let axiosConfig = {
                "url": `${process.env.API_GET_EMAIL_DETAILS_URL}?domain=${domain}&id=${emailId}`,
            };
            let emailContent = undefined;
            return await axios(axiosConfig)
            .then(email => {
                emailContent = email.data;
                let toAddresses = flattenAddressList(emailContent, "to");
                let ccAddresses = flattenAddressList(emailContent, "cc");
                let recipients = [...(toAddresses ? toAddresses : []), ...(ccAddresses ? ccAddresses : [])];
                recipients = recipients.filter(recipient => recipient !== bookmarksEmail);
                toAddresses.push(emailContent.from.value[0].address);
                return {
                  Source: fromEmail,
                  Destination: {
                      ToAddresses: toAddresses.filter(recipient => recipient !== bookmarksEmail), 
                      CcAddresses: ccAddresses ? ccAddresses.filter(recipient => recipient !== bookmarksEmail) : [],
                  },
                  ReplyToAddresses: [`${REPLY_TO_EMAIL_PREFIX.toLowerCase()}${domain}`],
                  Template: TEMPLATE_NAME,
                  TemplateData: JSON.stringify({
                      "SENDER": emailContent.from.value[0].name && 
                                emailContent.from.value[0].name.trim().length > 0 ? emailContent.from.value[0].name : emailContent.from.value[0].address,
                      "SUBJECT": emailContent.subject,
                      "RECIPIENTS": recipients.length > 0 ? recipients.join(";") : bookmarksEmail,
                      "HERE": emailHereLink
                  })
                };
            })
            .then(async r => {
                console.log(`Checking if email was sent to ${bookmarksEmail}`);
                if(addressListHasBookmarksEmail(emailContent.to, bookmarksEmail) || addressListHasBookmarksEmail(emailContent.cc, bookmarksEmail)){
                    let sp = new URL(emlDetails.RedirectUrl);
                    console.log(emlDetails.RedirectUrl, sp.pathname);
                    let shortlink = sp.pathname.substr(sp.pathname.lastIndexOf('/')+1);
                    let templateData = JSON.parse(r.TemplateData);
                    console.log(process.env.REDIRECT_FILES_LOCATION,
                      `r/${shortlink}/${process.env.TEMPLATED_INDEX_FILE_OUTPUT_FILE}`,
                      shortlink,
                      emailId,
                      templateData.SUBJECT);
                    return await writeTemplatedIndexFile(process.env.REDIRECT_FILES_LOCATION,
                      `r/${shortlink}/${process.env.TEMPLATED_INDEX_FILE_OUTPUT_FILE}`,
                      shortlink,
                      emailId,
                      templateData.SUBJECT,
                      templateData.SENDER)
                      .then(r => {
                          console.log(r);
                          return {status: 200, body: 'no-action-needed'};
                      })
                      .catch(e => console.log(e));
                }
                return {status: 200, body: 'no-action-needed'};
            })
            .catch(e => {
                console.log(e);
            });
        }
        return {status: 200, body: 'no-action-needed'};
    }
};