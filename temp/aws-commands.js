const { BedrockClient } = require('@aws-sdk/client-bedrock'); console.log('Available commands:'); console.log(Object.keys(BedrockClient.prototype.constructor.commands).join('
'));
