const simpleParser = require('mailparser').simpleParser;
const axios = require('axios');
var URL = require('url').URL;

const DELIM ='/';
let processEml = async (emlBody) => {
    return simpleParser(emlBody)
      .then( d => d);
};

const RESPONSE = {
    statusCode: 400,
    headers: {
        "Access-Control-Allow-Origin" : process.env.DEFAULT_CORS_ORIGIN, // Required for CORS support to work
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({'msg': 'no data'}),
};

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    //publicUrl=https://s3.amazonaws.com/bucket-name/key/path/eml-file-location
    const params = event.queryStringParameters;

    if(params.publicUrl){
        try{
            let emlUrl = new URL(params.publicUrl);
            return await axios(params.publicUrl)
            .then(async eml => {
                console.log('EML => ', eml.data);
                return await processEml(eml.data);
            })
            .then(d => {
                let x = JSON.parse(JSON.stringify(RESPONSE));
                x.headers['Access-Control-Allow-Origin'] = event.headers.origin || event.headers.referer;
                x.statusCode = 200;
                let y = JSON.parse(JSON.stringify(d));
                y.headers = {};
                for(let [key, value] of d.headers) {
                    y.headers[key] = value;
                }
                x.body = JSON.stringify(y);
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
        }catch(e){
            console.log(e);
            return RESPONSE;
        }
    }
    return RESPONSE;
};