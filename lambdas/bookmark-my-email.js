var AWS = require('aws-sdk');
const axios = require('axios');
const DELIM = '/';
const BOOKMARKS_EMAIL_PREFIX = process.env.BOOKMARKS_EMAIL_PREFIX;
const FROM_EMAIL_PREFIX = process.env.FROM_EMAIL_PREFIX;
const REPLY_TO_EMAIL_PREFIX = process.env.REPLY_TO_EMAIL_PREFIX;
const TEMPLATE_NAME = process.env.TEMPLATE_NAME;

let getAWSSNSRecordFromEvent = (event) => event.Records ? event.Records.find(r => r.EventSource === 'aws:sns') : undefined;
let getKeyPrefixFromKey = (key) => key.split(DELIM).slice(0, -1).join(DELIM);
let getEmlFilenameFromKey = (key) => key.split(DELIM).pop();
let AWS_ACCESS_KEY_ID=process.env.AWS_AKIA;
let AWS_SECRET_ACCESS_KEY=process.env.AWS_SECRET_ID;
const ses = new AWS.SES({region: process.env.SES_REGION, accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY});
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
                    console.log(`Email was sent to ${bookmarksEmail}!`);
                    return {status: 200, body: await ses.sendTemplatedEmail(r).promise()};   
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