var AWS = require('aws-sdk');
var emlformat = require('eml-format');
var URL = require('url').URL;

AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3();

var BUCKET_NAME = "mx.sairamachandr.in";
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env[`ALLOWED_DOMAINS`].split(","): ["example.com"];

let processEml = async (emlBody) => {
  return new Promise((resolve, reject) => {
    emlformat.read(emlBody, (e, d) => {
      if(e) reject(e);
      resolve(d);
      });   
    });
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

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
    
    // don't allow web based clients to read emails from any domain other than localhost
    // allow curl-type clients to query random domains by including domain=xyz in querystring
    if((event.headers.origin || event.headers.referrer) && getHostnameFromUrl(event.headers.origin || event.headers.referrer) !== 'localhost'){
        params.domain = getHostFromUrl(event.headers.origin || event.headers.referrer);
    }
    if(params.domain && ALLOWED_DOMAINS.includes(params.domain) && params.id){
        var getParams = {
            Bucket: BUCKET_NAME,
            Key: `${params.domain}/${params.id}`
        };
        return await s3.getObject(getParams)
        .promise()
        .then(data => {
            let emlBody = data.Body.toString('ascii');
            return processEml(emlBody);
        })
        .then(d => {
            let x = JSON.parse(JSON.stringify(RESPONSE));
            x.statusCode = 200;
            x.body = JSON.stringify(d);
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