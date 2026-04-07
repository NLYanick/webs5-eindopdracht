const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Target Service',
        description: 'Target Service API documentation'
    },
    host: 'localhost:3002',
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization'
        }
    }
};

const outputFile = './swagger-output.json';
const routes = ['./api-gateway/app.js'];

swaggerAutogen(outputFile, routes, doc);