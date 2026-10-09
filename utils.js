
async function callService(method, serviceAddress, resource, body, headers = null) {
    try {
        serviceAddress = formatWithSlashes(serviceAddress);
        let url = `${serviceAddress}${resource}`;

        const options = {
            method,
            headers: headers || {}
        }

        if (body) {
            if (options.method.toLowerCase() === "get") {
                const queryString = new URLSearchParams(body).toString();
                url = `${url}?${queryString}`;
            } else if (body instanceof FormData) {
                options.body = body;
            } else {
                options.body = JSON.stringify(body);
                options.headers['Content-Type'] = 'application/json';
            }
        }

        const response = await fetch(url, options);

        if (response.status === 500) throw new Error('Service responded with 500');

        if (response.status === 204) {
            return { message: "Deleted successfully", status: 204 };
        }

        let json;
        try {
            json = await response.json();
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            return { json: { error: 'Could not parse JSON response from API call' }, status: response.status };
        }

        return {
            json,
            status: response.status
        };
    } catch (error) {
        console.error(`Error calling service at ${serviceAddress}:`, error);
        throw error;
    }
}

function formatWithSlashes(serviceAddress) {
    return (serviceAddress.endsWith('/')) ? serviceAddress : `${serviceAddress}/`;
}

async function checkOpaqueAndReplaceWithJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No Authorization header found' });

    const opaqueToken = authHeader.split(' ')[1];
    if (!opaqueToken) return res.status(401).json({ message: 'Unauthorized. Token expired or invalid' });

    try {
        const { json } = await callService('post', process.env.AUTH_SERVICE, 'auth/receive-jwt', { opaqueToken });
        const jwtToken = json.token;

        if (!jwtToken) return res.status(401).json({ message: 'Unauthorized. Token expired or invalid' });

        req.headers['authorization'] = `Bearer ${jwtToken}`;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = {
    callService,
    checkOpaqueAndReplaceWithJWT
}