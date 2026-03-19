
async function callService(method, serviceAddress, resource, body, headers = null) {
    serviceAddress = formatWithSlashes(serviceAddress);
    let url = `${serviceAddress}${resource}`;

    const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers }
    }

    if (body) {
        if (options.method.toLowerCase() === "get") {
            const queryString = new URLSearchParams(body).toString();
            url = `${url}?${queryString}`;
        } else 
            options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 500) throw new Error(`Service responded with 500`);

    if (response.status === 204) {
        return { message: "Deleted successfully", status: 204 };
    }

    const json = await response.json();
    return {
        json,
        status: response.status
    };
}

function formatWithSlashes(serviceAddress) {
    return (serviceAddress.endsWith('/')) ? serviceAddress : '/';
}

async function checkOpaqueAndReplaceWithJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ message: 'No Authorization header found' });

    const opaqueToken = authHeader.split(' ')[1];
    if(!opaqueToken) return res.status(401).json({ message: 'Unauthorized. Token expired or invalid' });

    try {
        const { json } = await callService('post', process.env.AUTH_SERVICE, 'auth/check', { opaqueToken });
        const jwtToken = json.token;
        
        if(!jwtToken) return res.status(401).json({ message: 'Unauthorized. Token expired or invalid' });
        
        req.headers['authorization'] = `Bearer ${jwtToken}`;
        
        next();
    } catch(error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = { 
    callService,
    checkOpaqueAndReplaceWithJWT
}