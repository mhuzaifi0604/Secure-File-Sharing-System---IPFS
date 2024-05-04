// Importing necessary Libraries to connect to IPFS
import {create} from 'ipfs-http-client'; // Importing IPFS client from ipfs-http-client
import {Buffer} from 'buffer'; // Importing Buffer from buffer
import fs from 'fs'; // Importing fs from fs
import express from 'express'; // Importing express from express
import cors from 'cors';
import bodyParser from 'body-parser';
import { group } from 'console';

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

const Groups = [
    {
        name: '',
        description: '',
        prv_key: '',
        pub_key: '',
        owner: '',
        system_account: '',
        members: [],
        Files: [{
            name: '',
            path: '',
        }]
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

// Function to create group and add it to the network
app.post ('/createGroup', async (req, res) => {
    const data = req.body.data;
    // console.log("Group Data: ", data) ==> Logging Group Details recieved from frontend
    const newGroup = {
        name: data.group_details.group_name,
        description: data.group_details.description,
        prv_key: '',
        pub_key: '',
        owner: data.accounts_info.useraccount,
        system_account: data.accounts_info.systemaccount,
        members: [],
        Files: []
    }
    Groups.push(newGroup);
    console.log("Creating Group ...")
    res.status(200).send({Message: 'Group Created', Group: Groups.find(group => group.name === data.group_details.group_name)}); // sending group index to the client
})

// Function to return Groups of a specific user
app.get('/returnExistingGroups', async (req, res) => {
    try {
        const useraccount = req.query.useraccount;
        console.log("User's Account: ", useraccount)
        let userGroups = [];
        for (let i =0 ; i < Groups.length; i++){
            if (Groups[i].owner === useraccount){
                console.log(`Group ${i}: `, Groups[i].name)
                userGroups.push(Groups[i]);
            }
        }
        res.status(200).send({Groups: userGroups}); // sending group index to the client
    } catch (error) {
        console.log("Error Returning Group: ", error)
        res.status(500).send({Message: 'Error Returning Group'}); // sending group index to the client
    }
    
})
// Function to Upload Files to IPFS and add it to the group
app.post('/uploadFiles', async (req, res) => {
    const data = req.body.data;
    // console.log("File Data: ", data) ==> Logging Files to Upload and its content recieved from frontend
    const ipfs_client = await createIPFSClient();
    try {
        for (let i = 0; i < data.files.length; i++){
            console.log(`Uploading File ${data.files[i].filename}`)
            const file = data.files[i];
            const result = await addFileToIPFS(ipfs_client, file.fileContent)
            console.log(`Path for file ${file.filename}: `, result.path)
            const group = Groups.find(group => group.name === data.groupname);
            group.Files.push({name: file.filename, path: result.path})
        }
        console.log("Files Uploaded Successfull.")
        console.log("Updated Group Details: ", Groups.find(group => group.name === data.groupname))
        res.status(200).send({ Message: 'Files Uploaded', Files: Groups.find(group => group.name === data.groupname)?.Files || [] });// sending group index to the client
    } catch (error) {
        console.log("Error Uploading Files: ", error)
        res.status(500).send({Message: 'Error Uploading Files'}); // sending group index to the client
    }
})
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