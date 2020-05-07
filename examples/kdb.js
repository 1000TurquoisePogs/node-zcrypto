/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2020. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
const zcrypto = require('./');
const fs = require('fs')

function readKeysFromKDB() {
    if (fs.existsSync("my.kdb")) {
        fs.unlinkSync("my.kdb");
    }
    if (fs.existsSync("Cert.p12.nodedup")) {
        fs.unlinkSync("Cert.p12.nodedup");
    }

    var crypt = new zcrypto.ZCrypto();

    // Create a KDB file with a password, length and expiry time
    crypt.createKDB("my.kdb", "password", 10024, 0);

    // Open kdb file if it exists
    crypt.openKDB("my.kdb", "password");

    // Import a P12 file as Cert.p12 using password and label
    // Update only allowed for KDB
    rc = crypt.importKey("Cert.p12", "root", "MYCERT3");

    // Export to P12 using password and label
    crypt.exportKeyToFile("Cert.p12.nodedup", "root", "MYCERT3");

    // Convert from KDB/RACF Keyring to a PEM file
    var pem = zcrypto.exportLabelToPEM(crypt, "MYCERT3", "root");
    console.log(pem.key);
    console.log(pem.cert);

    // Convert from P12 File to PEM
    pem = zcrypto.exportP12FileToPEM("Cert.p12.nodedup", "root");
    console.log(pem.key);
    console.log(pem.cert);

    return pem;
}

var pem = readKeysFromKDB();
console.log(pem.key);
console.log(pem.cert);

// Load modules that we'll use.
const https = require('https'); // HTTPS web server.

// Configuration for the HTTPS web server.
const options = {
  key: pem.key,
  cert: pem.cert,
};

// Create the https server and begin listening for requests.
console.log("Listing on port 3000...\n");
https.createServer(options, (req, res) => {
  // This callback function will be called when someone makes a request to the https server.
  // req will contain the request data, while res will allow a response to be sent back.
  res.writeHead(200); // Set the HTTP response status codes to 200 OK.
  res.end('hello world\n'); // Write the string 'hello world\n' to the body, and send the response back.
}).listen(3000); // Listen for requests on port 3000.
