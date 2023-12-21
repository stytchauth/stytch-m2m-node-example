const express = require('express');
const dotenv = require('dotenv');
const stytch = require('stytch');

dotenv.config();

//stytch
const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
});


// Middleware for authenticating access token
const authenticateTokenMiddleware = (requiredScope) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      if (!token) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        // Validate the token using Stytch
        const params = {
          access_token: token,
          required_scopes: [requiredScope],
        };
        const response = await client.m2m.authenticateToken(params)
        console.log(response)
      next();
    } catch (error) {
      console.error('Error in middleware:', error);
      res.status(error.response ? error.response.status : 500).json({
        error: error.response ? error.response.data : 'Internal Server Error',
      });
    }
  }
}

module.exports = authenticateTokenMiddleware;
