var AWS = require('aws-sdk');
var emlformat = require('eml-format');
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
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: 'no data',
};

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //domain=zeer0.com&id=82vundohoan4rb4poes26r8rda5sb5vbgh9s3vo1&type=html&format=raw
    const params = event.queryStringParameters;
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
            console.log(Object.keys(d), d.headers);
            let x = JSON.parse(JSON.stringify(RESPONSE));
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
        .catch(e => console.log(e));
    }
    
    return RESPONSE;
};