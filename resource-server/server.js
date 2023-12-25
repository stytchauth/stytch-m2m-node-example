const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const stytch = require('stytch');
const authorizeToken = require('./middleware/authorizeToken')

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Customer's wallet details
const walletInfo = [
    { customerId: '67uhjio098uhgt6l', customerName: 'john_doe', walletId: 'oipk9ifgl7yto9w', walletBalance: 1790 },
    { customerId: 'plu8iio0t3uhh06h', customerName: 'jane_doe', walletId: 'ui099jlolrrao6g', walletBalance: 970 },
  ];

// Route
app.post('/api/check-balance', authorizeToken('read:users'), (req, res) => {
  const {customerId} = req.body;
  const customer = walletInfo.find((customer) => customer.customerId === customerId);
  if(customer){
    res.json({customerName: customer.customerName, walletId: customer.walletId, walletBalance: customer.walletBalance})
  }else{
    res.status(400).json({error: 'Invalid customer'})
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!', err);
});
  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});