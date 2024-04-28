// Importing necessary Libraries to connect to IPFS
import {create} from 'ipfs-http-client'; // Importing IPFS client from ipfs-http-client
import {Buffer} from 'buffer'; // Importing Buffer from buffer
import fs from 'fs'; // Importing fs from fs
import express from 'express'; // Importing express from express
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express(); // Creating express app
// app.use(express.json()); // Using express.json
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const Groups = [
    {
        name: '',
        description: '',
        prv_key: '',
        pub_key: '',
        owner: '',
        members: []
    }
]

app.post('/register', async (req, res) => {
    const data = req.body.data;
    console.log("User Regustered with Public Key: ", data)
    res.send('Data received');
})

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

async function addFileToIPFS(ipfs_client){
    const file = fs.readFileSync('./package.json');
    const content = Buffer.from(file);
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
getData();

const port = process.env.PORT || 3000; // Use the port provided by the environment or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});