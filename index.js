const express = require('express');
const app=express()
const cors = require('cors');
const port=process.env.PORT||2000
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors())
app.use(express.json())
//Verify Token

function verifyJWT(req,res,next){
    const auth=req.headers.authorization
    if(!auth){
      return res.status(401).send({message:'Unauthorized access'})
    }
    const token=auth.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_KEY,(err,decoded)=>{
      if(err){
        return res.status(403).send({message:'Forbidden'})
      }
     req.decoded=decoded
     next()
    })
    console.log('insideJWT',auth)
    
  }

//Connections API

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7yw4z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
   try{
    await client.connect();
    const partsCollection=client.db('Eauto').collection('products')
    const orderCollection=client.db('Eauto').collection('orders')
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

    //Order Collection API

 app.get('/order', verifyJWT,async(req,res)=>{
    const decodedEmail=req.decoded.email
     const email=req.query.email
     if(email===decodedEmail){
        const query={email:email}
        const cursor=orderCollection.find(query)
        const order=await cursor.toArray()
        res.send(order)
     }
     else{
        return res.status(403).send({message:'Forbidden'})
     }
    
 })

 app.post('/order',async(req,res)=>{
    const order=req.body
    const result= await orderCollection.insertOne(order)
    res.send(result)
  })

  //Auth
app.post('/login',async(req,res)=>{
    const user=req.body
    const accessKey=jwt.sign(user,process.env.ACCESS_KEY,{
      expiresIn:'1d'
    })
    res.send(accessKey)
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