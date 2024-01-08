const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const stytchHelpers = require('./Helpers/stytch');

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
async function connectToMongoDB() {
    const mongoURI = process.env.MONGODB_URI;
    try {
        const client = await MongoClient.connect(mongoURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });
        console.log('Connected to MongoDB');
        return client.db('m2m_credentials');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let db;

// Mount Stytch routes
app.use(stytchHelpers.router);

// Payment details of the pending outgoing debit
const paymentInfo = {
    customerId: '67uhjio098uhgt6l',
    debitAmount: 769,
    destinationWalletId: 'yh809ikol7plo98'
};

// Initiate the payment process
app.get('/initiate-payment', async (req, res) => {
    // Create an m2m client
    try {
    // Connect to MongoDB and set up routes and server
        db = await connectToMongoDB();
        const m2mClient = await stytchHelpers.getM2MClient(db);
        // Get M2M access token (cached if possible)
        const {client_id, client_secret} = m2mClient;
        const accessToken = await stytchHelpers.getM2MAccessToken(db, client_id, client_secret);
        // Initiate payment
        const walletResponse = await initiatePayment(accessToken);
        res.json(walletResponse);
    }
    catch (err) {
        console.error(err.response ? err.response.data : err.message);
        res.status(err.response ? err.response.status : 500).json({
            error: err.response ? err.response.data : 'Internal Server Error'
        });
    }
});

async function initiatePayment(accessToken) {
    const walletServerUrl = 'http://localhost:4000/api/check-balance'; // Replace with your resource server URL
    try {
        // Request customer balance from wallet server
        const response = await axios.post(walletServerUrl, paymentInfo, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const {customerName, walletBalance} = response.data;
        // Check if the balance is sufficient for the transaction
        if (walletBalance >= paymentInfo.debitAmount) {
            // Proceed with the transaction logic
            console.log('Transaction successful!');
            return `${customerName} your payment of ${paymentInfo.debitAmount} to ${paymentInfo.destinationWalletId} was successful!`;
        }
        console.log('Insufficient balance. Transaction failed.');
        return 'Insufficient balance. Transaction failed.';
    } catch (error) {
        console.error('Error connecting with the Wallet Server:', error.response ? error.response.data : error.message);
        throw error;
    }
}

const rotationInterval = 60 * 60 * 1000; // 1 hour in milliseconds
//rotate secret every 1hr
setInterval(async () => {
    db = await connectToMongoDB();
    stytchHelpers.startSecretRotation(db);
}, rotationInterval);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
  
// Start the client server
app.listen(PORT, () => {
    console.log(`Client server is running on port ${PORT}`);
});