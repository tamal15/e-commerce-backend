// e-commerce-site
// jxjFr9MI4pLrJS0s
const express= require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require("cors");

const app=express();
const port = 5000;
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const uri = "mongodb+srv://e-commerce-site:jxjFr9MI4pLrJS0s@cluster0.utq7asn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try{
        await client.connect();
        console.log("connected to database");
        const database = client.db('e-commerce');
        const buyerCollection = database.collection('buyerProduct');

    //    post product buyer 
        app.post('/postBuyer', async(req,res) =>{
            const user=req.body;
            console.log(user)
            const result=await buyerCollection.insertOne(user);
            res.json(result)
        });

        app.get('/postBuyer', async(req,res)=>{
            const result=await buyerCollection.find({}).toArray()
            res.json(result)
        })
       

    }

    finally{
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req,res)=>{
    res.send("online shopping");
   });

   app.listen(port, ()=>{
    console.log("runnning online on port", port);
  }); 