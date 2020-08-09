#!/bin/bash

LAYER_NAME="zeer0-nodejs-layer"
PROFILE="zeer0-aws"
REGION="ap-south-1"

cd nodejs
rm -rf node_modules/
npm install
 
cd ..
zip -r ${LAYER_NAME}.zip nodejs/
unzip -l ${LAYER_NAME}.zip

echo "Publishing new layer version using profile ${PROFILE}"
aws lambda publish-layer-version --layer-name ${LAYER_NAME} --compatible-runtimes nodejs12.x --zip-file "fileb://${LAYER_NAME}.zip" --profile ${PROFILE} --region ${REGION}
