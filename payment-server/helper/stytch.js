const express = require('express');
const stytch = require('stytch');
const dotenv = require('dotenv');
const router = express.Router();
const NodeCache = require('node-cache');
const myCache = new NodeCache({
    stdTTL: 3600,
    checkperiod: 3600,
    useClones: false,
    forceString: true
});

dotenv.config();
// Initializing Stytch client
const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID,
    secret: process.env.STYTCH_SECRET
});

// Get M2M access token
async function getM2MAccessToken(clientId, clientSecret) {
    try {
        // Get M2M access token from node-cache
        const accessTokenInfo = myCache.get('accessToken');
        if (accessTokenInfo) return accessTokenInfo;
        // If the cached token is expired or not available, request a new one
        const params = {
            client_id: clientId,
            client_secret: clientSecret,
            scopes: ['read:users'], // Adjust scopes as needed
            grant_type: 'client_credentials'
        };
        const response = await client.m2m.token(params);
        // Save new access token to node-cache
        myCache.set('accessToken', response.access_token, response.expires_in);

        return response.access_token;
    } catch (err) {
        console.error('Error getting M2M access token:', err.response);
        throw err;
    }
}

// Search for an M2M client
router.get('/search-m2m-client', async (req, res) => {
    try {
        // Call Stytch endpoint to search for the M2M client
        const params = {
            limit: 100,
            query: {
                operator: 'OR',
                operands: [
                    {
                        filter_name: 'client_name',
                        filter_value: ['payment-service']
                    }
                ]
            }
        };
        const response = await client.m2m.clients.search(params);
        res.json({
            search_Result: response
        });
    } catch (err) {
        console.error('Error searching for M2M client:', err.response ? err.response.data : err.message);
        res.status(err.response ? err.response.status : 500).json({
            error: err.response ? err.response.data : 'Internal Server Error'
        });
    }
});

// Update an M2M client
router.put('/update-m2m-client/:clientId', async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const status = req.body.status;
        console.log(clientId, status);
        // Call Stytch endpoint to update the M2M client
        const params = {
            client_id: clientId,
            status: status
        // Include any parameters you want to update
        // Example: scopes: ['new:scope'],
        };
        const response = await client.m2m.clients.update(params);
        res.json({
            updated_m2mClient: response
        });
    } catch (err) {
        console.error('Error updating M2M client:', err.response ? err.response.data : err.message);
        res.status(err.response ? err.response.status : 500).json({
            error: err.response ? err.response.data : 'Internal Server Error'
        });
    }
});

// Start secret rotation
router.get('/start-secret-rotation', async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        // Start the secret rotation
        const params = {
            client_id: clientId
        };
        const response = await client.m2m.clients.secrets.rotateStart(params);
        // Switch the old client_secret for the next_client_secret

        res.json (response.m2m_client.next_client_secret);
    } catch (err) {
        console.error('Error starting secret rotation:', err.response);
        throw err;
    }
});
// Complete the secret rotation
router.get('/complete-secret-rotation', async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        // Permanently switch the client_secret for the next_client_secret
        const params = {
            client_id: clientId
        };
        
        await client.m2m.clients.secrets.rotate(params);
        res.json({ message: 'Secret rotation completed successfully' });
    } catch (err) {
        console.error('Error completing secret rotation:', err.response);
        throw err;
    }
});

module.exports = {
    router,
    getM2MAccessToken
};