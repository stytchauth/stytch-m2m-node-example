# Stytch M2M authentication example in Node.js
## Overview
This example application demonstrates how one may use Stytch's suite of M2M authentication endpoints within a Node.js application. 

The application features two backend services in a hypothetical fintech neobank: the Payment Management Service and the Wallet Management Service. The Payment Service, which is responsible for processing outward debits from a PayPal customer's wallet, securely communicates with the Wallet Service to access a customer’s current “walletBalance”.

The Payment Service requires the customer's current wallet balance to determine whether they have sufficient funds to successfully process a pending outward debit of $769 from their PayPal wallet. Throughout the code, we occasionally refer to the Payment Service as “client-server” and the Wallet Service as “resource-server”.

The application utilizes Stytch’s M2M endpoints to create M2M applications, request and authenticate JWT access tokens, define permission scopes, rotate client secrets, and update M2M clients. This project also utilizes [Stytch's Node Backend SDK](https://www.npmjs.com/package/stytch) to validate all issued JWT access tokens.

The example application has two directories: a client-server that’s responsible for processing outgoing debits from a PayPal customer's wallet, and a resource-server that holds the protected resource that the client-server needs secure access to (“walletInfo”).
### Two main directories
- Client-server (holds the stytch.js implementation, the mongodb.js helper functions, and the server.js file for initiating payment).
* Resource-server (holds the middleware directory that contains the authorizeToken.js implementation and the server.js file that contains the customer’s wallet balance).

The client-server directory contains a helper directory that holds the stytch.js file with our Stytch implementation, except for authorizing access tokens. The helper directory also holds a mongodb.js file that contains our MongoDB helper functions to persist and access our stored credentials from storage. In addition, the client-server houses a server.js file, which serves as the directory's entry point, mounts the "/initiate-payment" route to process outward payments and handles M2M client creation via stytch.js.

On the other hand, the resource-server directory holds a middleware directory that contains an authorizeToken.js file. This file authorizes access tokens with the necessary scopes before granting access to the protected resource. The resource-server also contains a server.js file which holds the protected resource (“walletInfo”) and mounts the “/api/check-balance” route to return the requested customer’s wallet details, specifically their “walletId” and “walletBalance”.
## Set up
If you want to run the example application on your machine, make sure you follow the steps below.
### In your Stytch Dashboard
[Sign up](https://stytch.com/start-now) to get a Stytch developer account if you don’t have one. Then, [log in to your Stytch account](https://stytch.com/start-now) and create a Consumer Authentication project if you don’t have one already.

<img width="736" alt="M2M_2_create_project_screenshot" src="https://github.com/StytchExamples/stytch-m2m-node-example/assets/154470731/9c7de817-8a15-4794-b2ff-3d81d89bafe1">

Now that your account is set up, go to the [Dashboard](https://stytch.com/dashboard/home) and click API Keys under the Configuration section of the sidenav. We’ll be using your Stytch Project’s Test environment, so copy your Project’s credentials: the “project_id” and “secret”.

![M2M_2_project_id_screenshot](https://github.com/StytchExamples/stytch-m2m-node-example/assets/154470731/cb3c27bc-7dfe-4173-9297-eccbe4e51b61)

### On your machine
To begin, you have to clone the example application. Run the following command in the terminal to clone it. The example app is an Express app.

```
git clone https://github.com/StytchExamples/stytch-m2m-node-example/
```

Next, navigate to the root of both the client-server and resource-server directories and run the following commands to install the dependencies for each directory:

```
// In the client-server directory
cd client-server
npm install

// In the resource-server directory
cd resource-server
npm install
```
In the root of both the client-server and resource-server directories, create a .env file and populate the fields with your Project’s credentials that you copied, using the following key/value format:

```
//.env file for the (client-server)
PORT=5000
STYTCH_PROJECT_ID = 'Provide Your Stytch Project Id'
STYTCH_SECRET = 'Provide Your Stytch Project Secret'
MONGODB_URI = 'mongodb+srv://<username>:<password>@<cluster-address>/<database>?retryWrites=true&w=majority'

//.env file for the (resource-server)
PORT=4000
STYTCH_PROJECT_ID='Provide Your Stytch Project ID'
STYTCH_SECRET='Provide Your Stytch Project Secret'
```
### Running the example app locally
After completing all the previous steps, you can run each of the servers with the following command:

```
// Run the client-server
npx nodemon

// Run the resource-server
npx nodemon
```

The client-server (Payment Service) will be available at http://localhost:5000, and the resource-server (Wallet Service) will be available at http://localhost:4000 when you run them locally on your machine. 
## Get help and join the community
### 💬 Stytch community Slack
Join the discussion, ask questions, and suggest new features in our [Slack community](https://stytch.slack.com/join/shared_invite/zt-nil4wo92-jApJ9Cl32cJbEd9esKkvyg#/shared-invite/email)!

### ❓ Need support?
Check out the [Stytch Forum](https://forum.stytch.com/) or email us at support@stytch.com.
