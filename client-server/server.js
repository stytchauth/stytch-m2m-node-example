const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const stytchHelpers = require('./Helpers/stytch')

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
                deprecationErrors: true,
            },
            useNewUrlParser: true,
            // sslValidate: true, // Enable SSL validation
            // tlsCAFile: process.env.MONGODB_CA_FILE, // Path to CA certificate file
            // tlsCertificateKeyFile: process.env.MONGODB_CERT_KEY_FILE, // Path to client certificate and private key file
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

//mount stytch routes
app.use(stytchHelpers.router)

// payment details
const paymentDetails = {
    customerId: '123456',
    debitAmount: 769,
    destinationWalletId: 'yh809ikol7',
  };

//routes
// Endpoint to initiate the payment process
app.get('/initiate-payment', async (req, res) => {
   //create an m2m client
   try{
    // Connect to MongoDB and set up routes and server
    db = await connectToMongoDB();
    const m2mClient = await stytchHelpers.createM2MClient(db);
    // Get M2M access token (cached if possible)
    const accessToken = await stytchHelpers.getM2MAccessToken(db, m2mClient.client_id, m2mClient.client_secret);
    // initiate payment
    const accountResponse = await initiatePayment(accessToken);

    res.json(accountResponse);
   }catch (err){
        console.error(err.response ? err.response.data : err.message);
            res.status(err.response ? err.response.status : 500).json({
                error: err.response ? err.response.data : 'Internal Server Error',
        });
   }
});

async function initiatePayment(accessToken) {
    const accountServerUrl = 'http://localhost:4000/api/check-balance'; // Replace with your resource server URL
    try {
        //request customer balance from account server
        const response = await axios.post(accountServerUrl, paymentDetails, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            },
        });
        const {customerName, balance} = response.data
        // Check if the balance is sufficient for the transaction
        if (balance >= paymentDetails.debitAmount) {
            // Proceed with the transaction logic
            console.log('Transaction successful!');
            return `${customerName} your payment of ${paymentDetails.debitAmount} to ${paymentDetails.destinationWalletId} was successful!`;
        }
        console.log('Insufficient balance. Transaction failed.');
        return 'Insufficient balance. Transaction failed.';
    } catch (error) {
      console.error('Error connecting with the Account Server:', error.response ? error.response.data : error.message);
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
    console.log(`Client Server is running on port ${PORT}`);
});