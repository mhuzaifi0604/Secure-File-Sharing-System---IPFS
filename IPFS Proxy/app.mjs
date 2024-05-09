// Importing necessary Libraries to connect to IPFS
import {create} from 'ipfs-http-client'; // Importing IPFS client from ipfs-http-client
import {Buffer} from 'buffer'; // Importing Buffer from buffer
import express from 'express'; // Importing express from express
import cors from 'cors';
import bodyParser from 'body-parser';
import { group } from 'console';
import crypto from 'crypto';

const app = express(); // Creating express app
// app.use(express.json()); // Using express.json
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

var selectedAccount = '';
var system_account = '';
var Registered_User_Details = {
    user_pub_key: '',
    Transaction_Hashes: []
}

var Groups = [
    {
        name: '',
        description: '',
        prv_key: '',
        pub_key: '',
        owner: '',
        system_account: '',
        members: [],
        Files: [],
        names: [],
        paths: []
    }
]
// ================================================== API Endpoints ==================================================

// Function to register a user with Network to create groups and upload Files
app.post('/register', async (req, res) => {
    const data = req.body.data;
    // console.log("System & registered User's Keys: ", data) ==> Logging User's and System's Public Keys recieved from frontend
    selectedAccount = data.user;
    system_account = data.system;
    Registered_User_Details.user_pub_key = data.user;
    Registered_User_Details.Transaction_Hashes.push(data.txHash);
    console.log("Registering User ...")
    // console.log("Registered User's Details: ", Registered_User_Details) ==> Logging User Details who registered
    res.status(200).send('Accounts received'); // 200 is the status code for OK
})

// function to return a user's details
app.get('/getUser', async (req, res) => {
    res.send({useraccount: selectedAccount, systemaccount: system_account}); // sending user's account to the client
})

app.post('/updateGroups', async (req, res) => {
    const data = req.body.data;
    console.log("Updating Groups ...")
    Groups = data.groups;
    console.log("Updated Groups: ", data.groups)
    res.status(200).send({message: 'Groups Updated', groups: Groups}); // sending user's account to the client
})

// Function to create group and add it to the network
app.post ('/createGroup', async (req, res) => {
    const data = req.body.data;
    // console.log("Group Data: ", data) ==> Logging Group Details recieved from frontend
    const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    const newGroup = {
        name: data.group_details.group_name,
        description: data.group_details.description,
        prv_key: privateKey,
        pub_key: publicKey,
        owner: data.accounts_info.useraccount,
        system_account: data.accounts_info.systemaccount,
        members: [],
        Files: [],
        names: [],
        paths: []
    }
    Groups.push(newGroup);
    console.log("Creating Group ...")
    res.status(200).send({Message: 'Group Created', Group: Groups.find(group => group.name === data.group_details.group_name)}); // sending group index to the client
})

// Function to return Groups of a specific user
app.get('/returnExistingGroups', async (req, res) => {
    try {
        const useraccount = req.query.useraccount;
        console.log("User's Account in return: ", useraccount)
        let userGroups = [];
        for (let i =0 ; i < Groups.length; i++){
            if ((Groups[i].owner).toLowerCase() === useraccount || Groups[i].members.includes(useraccount) ) {
                console.log(`Group ${i}: `, Groups[i].name)
                userGroups.push(Groups[i]);
            }
        }
        console.log("Resturned Groups: ", userGroups)
        res.status(200).send({Groups: userGroups}); // sending group index to the client
    } catch (error) {
        console.log("Error Returning Group: ", error)
        res.status(500).send({Message: 'Error Returning Group'}); // sending group index to the client
    }
    
})

// Function to add members to the group
app.post('/addMembers', async (req, res) => {
    const data = req.body.data;
    console.log("Member Data: ", data) //==> Logging Member Details recieved from frontend
    try {
        const group = Groups.find(group => group.name === data.groupname);
    data.members.forEach((member) => {
        group.members.push(member)
    })
    // console.log("Updated Group Details: ", group)
    res.status(200).send({Message: 'Member Added', Group: group}); // sending group index to the client
    } catch (error) {
        res.status(500).send({Message: 'Error Adding Member'}); // sending group index to the client
    }
    
})

const getdecryptedDat = (data, privateKey) => {
    console.log("Private key in retrieve: ", privateKey)
    const bufferData = Buffer.from(data, 'hex'); // Convert the string data to a Buffer
    // const iv = bufferData.slice(0, 16);
    const aeskeylength = bufferData.readUInt32BE(0);
    const encAesKey = bufferData.slice(4, 4 + aeskeylength);
    console.log("total data length: ", bufferData.length)
    console.log("AEs key length on retrieval: ", aeskeylength)
    const iv = bufferData.slice(4 + aeskeylength, 4 + aeskeylength + 16);
    const encryptedContent = bufferData.slice(4 + aeskeylength + 16, bufferData.length);
    // const encAesKey = bufferData.readIntBE(4, aeskeylength);
    // const iv = bufferData.readIntBE(4 + aeskeylength, 16);
    // const encryptedContent = bufferData.readIntBE(4 + aeskeylength + 16, bufferData.length - (4 + aeskeylength + 16));
    const decaeskey = crypto.privateDecrypt(privateKey, encAesKey);
  
    const aesDecipher = crypto.createDecipheriv('aes-256-cbc', decaeskey, iv);
    let decryptedData = aesDecipher.update(encryptedContent, 'base64', 'utf8');
    decryptedData += aesDecipher.final('utf8');
    return decryptedData;
  };
  
  const getDatatoUpload = async (data, publicKey) => {
    console.log("Public key in upload: ", publicKey)
    const aesKey = crypto.randomBytes(32);
    const aesIV = crypto.randomBytes(16);
    const aescipher = crypto.createCipheriv('aes-256-cbc', aesKey, aesIV);
    var encryptedContent = aescipher.update(data, 'utf8', 'base64');
    encryptedContent += aescipher.final('base64');
    var encAesKey;
    try {
        console.log("Public Key: ", publicKey, " AES Key: ", aesKey)
        encAesKey = crypto.publicEncrypt(publicKey, aesKey);
    } catch (error){
        console.log("Error Encrypting AES Key: ", error);
    }

  
    const aeskeylength = Buffer.alloc(4);
    console.log("Exc key length: ", encAesKey.length)
    aeskeylength.writeUInt32BE(encAesKey.length, 0);
    const encryptedDatawithAesKey = Buffer.concat([aeskeylength, encAesKey, aesIV, Buffer.from(encryptedContent, 'base64')]);
    return encryptedDatawithAesKey.toString('hex');
  };
  
  // Function to Retrieve Decrypted Files from the IPFS server
  app.get('/retrieveFiles', async (req, res) => {
    const filename = req.query.filename;
    const filepath = req.query.filepath;
    const groupname = req.query.groupname;
    console.log("Retrieving File: ", filename, " from IPFS Server ...");
    try {
      const group = Groups.find(group => group.name === groupname);
    //   const file = group.Files.find(file => file.name === filename);
      console.log("File Path: ", filepath);
      const ipfs_client = await createIPFSClient();
      let data = '';
      for await (const itr of ipfs_client.cat(filepath)) {
        data += Buffer.from(itr).toString();
      }
      const decryptedData = getdecryptedDat(data, group.prv_key);
      res.status(200).send({ Message: 'File Retrieved', Data: decryptedData });
    } catch (error) {
      console.log("Error Retrieving File: ", error);
      res.status(500).send({ Message: 'Error Retrieving File' });
    }
  });
  
  // Function to Upload Files to IPFS and add them to the group
  app.post('/uploadFiles', async (req, res) => {
    const data = req.body.data;
    const ipfs_client = await createIPFSClient();
    try {
      for (let i = 0; i < data.files.length; i++) {
        console.log(`Uploading File ${data.files[i].filename}`);
        const group = Groups.find(group => group.name === data.groupname);
        const file = data.files[i];
        const encryptedContent = await getDatatoUpload(file.fileContent, group.pub_key);
        const result = await addFileToIPFS(ipfs_client, encryptedContent);
        console.log(`Path for file ${file.filename}: `, result.path);
        group.Files.push({ name: file.filename, path: result.path });
      }
      console.log("Files Uploaded Successfully.");
      console.log("Updated Group Details: ", Groups.find(group => group.name === data.groupname));
      res.status(200).send({ Message: 'Files Uploaded', Group: Groups.find(group => group.name === data.groupname)});
    } catch (error) {
      console.log("Error Uploading Files: ", error);
      res.status(500).send({ Message: 'Error Uploading Files' });
    }
  });
// ================================================== =============== ==================================================
// ================================================== IPFS Functions ==================================================

// Function to create IPFS client
async function createIPFSClient(){
    const ipfs_client = create({
        host: 'localhost',
        port: 5001,
        protocol: 'http' // Change protocol to 'http'
    });
    
    return ipfs_client;
}

// Function to add text to IPFS
async function addTextToIPFS(ipfs_client, text){
    const content = Buffer.from(text); // converting text to buffer
    const result = await ipfs_client.add(content); // adding content to IPFS
    return result;
}

async function addFileToIPFS(ipfs_client, content){
    const result = await ipfs_client.add(content);
    return result;
}
// Fuction to retrieve data from IPFS
async function retrieveDataFromIPFSClient (client, hash){
    console.log("Hash: ", hash)
    let asyncitr = client.cat(hash) // getting data from IPFS using hash
    for await (const itr of asyncitr) { // converting data to string and logging it
        let data = Buffer.from(itr).toString()
        console.log("Data Uploaded on IPFS Client: ", data)
    }
}

// Main function to run the code
async function getData(){
    const client = await createIPFSClient(); // Wait for client creation
    const result = await addFileToIPFS(client)
    console.log("Result: ", result); // Wait for addTextToIPFS to finish
    retrieveDataFromIPFSClient(client, result.path)
}
// Starting the main function
// getData();

const port = process.env.PORT || 3000; // Use the port provided by the environment or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});