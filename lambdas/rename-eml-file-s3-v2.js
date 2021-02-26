/**
 * This lambda renames eml files as they arrive into S3 from SES
 * The first email is prefixed with 
 * ${SEQ_IDENTIFIER}${START_SEQUENCE_AT}${SEQ_IDENTIFIER}${Date.now()}${SEQ_IDENTIFIER}
 * 
 * E.g., ___ZZZZZZZZZZ__16142389908___<eml-file-name>
 * 
 * To use this lambda, create an event trigger from S3 which renames files as they arrive
 * 
 * Why do we need this?
 * ---
 * Since eml files can have any name, renaming them using this lambda allows us to sort them 
 * in reverse order of receipt
**/
const AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION || 'us-east-1'});
var s3 = new AWS.S3({signatureVersion: 'v4'});

const ALPHABET = process.env.ALPHABET || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DELIM = "/";
const SEQ_IDENTIFIER = process.env.SEQUENCE_IDENTIFIER || '___';
const START_SEQUENCE_AT = process.env.START_SEQUENCE_AT || 'ZZZZZZZZZZ';
let copyObject = async (bucket, oldKey, newKey) => {
    return s3.copyObject({
            Bucket: bucket,
            CopySource: `${bucket}/${oldKey}`, 
            Key: newKey
        }).promise();
};
let deleteObject = async (bucket, key) => {
    return s3.deleteObject({
      Bucket: bucket, 
      Key: key
    }).promise();
};
let getFilenameFromKey = (key) => {
    if(s3ObjectMustBeRenamed(key)){
        return key.split(DELIM).pop();
    }
    return undefined;
};
let getFilepathFromKey = (key) => {
    if(s3ObjectMustBeRenamed(key)){
        return key.split(DELIM).slice(0, -1).join(DELIM);
    }
    return undefined;
};
let getNextPrefix = (currentPrefix) => {
    if(currentPrefix){
        let arr = currentPrefix.split('').reverse();
        let idx = arr.findIndex( l => l !== 'A' ) || 0;
        let nextLetter = ALPHABET.charAt(ALPHABET.indexOf(arr[idx]) - 1);
        arr.splice(idx, 1, nextLetter);
        arr.splice(0, idx, ...'Z'.repeat(idx).split('')).reverse().join();
        let x = arr.reverse().join('');
        return x;
    }
    return START_SEQUENCE_AT;
};
let getSequencePrefixFromFilename = (fn) => {
    let seqStart = fn.indexOf(SEQ_IDENTIFIER);
    let seqEnd = fn.indexOf(SEQ_IDENTIFIER, SEQ_IDENTIFIER.length);
    return fn.substring(seqStart + SEQ_IDENTIFIER.length, seqEnd);
};
let newestFileInBucket = async (bucketname, prefix) => {
    prefix = prefix || '';
    console.log(`Bucket = ${bucketname}, prefix = ${prefix}${SEQ_IDENTIFIER}`);
    return s3.listObjectsV2({
        Bucket: bucketname,
        Prefix: `${prefix}${DELIM}${SEQ_IDENTIFIER}`,
        MaxKeys: 1
    }).promise();
};
// allow files placed arbitrarily deep
// to be renamed
let s3ObjectMustBeRenamed = (key) => key.lastIndexOf('/') !== key.length - 1; //key is not a folder, rename it.;
exports.handler = async (event) => {
    console.log(event);
    //1. get the key from the message
    var Records = event.Records;
    let OLD_KEY = Records[0].s3.object.key;
    let response = {
        statusCode: 200,
        body: 'Rename request was received',
    };
    console.log(response.body);
    if(s3ObjectMustBeRenamed(OLD_KEY)){
        let filename = getFilenameFromKey(OLD_KEY);
        let filepath = getFilepathFromKey(OLD_KEY);
        let bucketname = Records[0].s3.bucket.name;
        
        //2. get the newest file name from the s3 bucket
        return await newestFileInBucket(bucketname, filepath)
        .then(objectDtls => {
            if(objectDtls.KeyCount === 1){
                let newestFileName = getFilenameFromKey(objectDtls.Contents[0].Key);
                return getSequencePrefixFromFilename(newestFileName);
            }
            console.log(`No sequenced files found!`);
            return undefined;
        })
        .then(prefix => getNextPrefix(prefix))
        .then(nextPrefix => `${SEQ_IDENTIFIER}${nextPrefix}${SEQ_IDENTIFIER}${Date.now()}${SEQ_IDENTIFIER}${filename}`)
        .then(async newFilename => {
            let newKey = `${filepath}${DELIM}${newFilename}`;
            return await copyObject(bucketname, OLD_KEY, newKey);
        })
        .then(() => {
            response.body = JSON.stringify('File was copied');
            console.log(response.body);
        })
        .then(async () => {
            return await deleteObject(bucketname, OLD_KEY);
        })
        .then(() => {
            response.body = JSON.stringify('File was renamed');
            console.log(response.body);
        })
        // Error handling is left up to reader
        .catch((e) => {
            console.error(e);
            response.statusCode = 400;
            response.body = JSON.stringify('File was not renamed');
            console.log(response.body);
        })
        .finally(() => response);
    }
    response.body("Ignoring rename request");
    return response;
};
