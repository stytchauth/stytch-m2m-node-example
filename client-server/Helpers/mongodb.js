  // Helper function to retrieve credentials from MongoDB
  async function getCredentials(db) {
    try{
        const credentials = await db.collection('credentials').findOne({});
        return credentials || {};
    }catch(err){
        console.error('Error getting credentials from MongoDB:', err);
        throw err;
    }
}
// Helper function to store credentials in MongoDB
async function storeCredentials(db, credentials) {
   try{
    await db.collection('credentials').updateOne({}, { $set: credentials }, { upsert: true });
   }catch(err){
    console.error('Error storing credentials in MongoDB:', err);
    throw err;
   }
}

// Helper Function to retrieve access token from MongoDB
async function getAccessToken(db) {
    try {
        // Retrieve the cached access token information from MongoDB
        return await db.collection('accessToken').findOne({});
    } catch (err) {
        console.error('Error getting access token:', err);
        throw err;
    }
}

// helper function to store the access token and its expiration time in MongoDB
async function storeAccessToken(db, accessToken, expiresAt) {
    try {
        await db.collection('accessToken').updateOne({}, { $set: { access_token: accessToken, expires_at: expiresAt } }, { upsert: true });
    } catch (err) {
        console.error('Error storing access token:', err);
        throw err;
    }
}

module.exports = {getCredentials, storeCredentials, getAccessToken, storeAccessToken};