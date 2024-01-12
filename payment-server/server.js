const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const axios = require('axios');
const stytchHelpers = require('./helper/stytch');

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    try {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        // Get M2M access token
        const accessToken = await stytchHelpers.getM2MAccessToken(clientId, clientSecret);
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
    const walletServerUrl = 'http://localhost:4000/api/check-balance'; // Replace with your wallet-server URL
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
  
// Start the client server
app.listen(PORT, () => {
    console.log(`Client server is running on port ${PORT}`);
});