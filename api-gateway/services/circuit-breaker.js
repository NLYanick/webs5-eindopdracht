const CircuitBreaker = require('opossum');
const { callService } = require('../utils');

const breakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000
};

function initCircuitBreaker() {
    const circuitBreaker = new CircuitBreaker(callService, breakerOptions);

    circuitBreaker.fallback(() => fallbackFunction());

    circuitBreaker.on("fallback", (result) => {
        console.log("fallback:", result);
    });
    circuitBreaker.on("open", () => console.log("opened"));
    circuitBreaker.on("halfOpen", () => console.log("halfOpened"));
    circuitBreaker.on("close", () => console.log("closed"));

    return circuitBreaker;
}

function fallbackFunction(error) {
    return {
        json: {
            message: "Sorry, the service is currently out of service.",
            error: error?.message
        },
        status: 503
    };
}

const circuitBreaker = initCircuitBreaker();

module.exports = circuitBreaker