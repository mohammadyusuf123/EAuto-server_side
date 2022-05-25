const express = require('express');
const app=express()
const cors = require('cors');
const port=process.env.PORT||2000
// const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors())
app.use(express.json())

//Connections API

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7yw4z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
   try{
    await client.connect();
    const partsCollection=client.db('Eauto').collection('products')
    // Parts API
    app.get('/parts',async(req,res)=>{
        const query={}
        const cursor= partsCollection.find(query)
        const parts=await cursor.toArray()
        res.send(parts)
    })
    // Parts API By Id
    app.get('/parts/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id:ObjectId(id)}
        const singleParts=await partsCollection .findOne(query)
        res.send( singleParts)

    })
   }
   finally{

   }
}
run().catch(console.dir)


//Root API
app.get('/',(req,res)=>{
    res.send('Server is running')
})
app.listen(port,()=>{
    console.log('listing from',port)
})