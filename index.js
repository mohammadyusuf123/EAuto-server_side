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
    
  }

//Connections API

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7yw4z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
   try{
    await client.connect();
    const partsCollection=client.db('Eauto').collection('products')
    const orderCollection=client.db('Eauto').collection('orders')
    const usersCollection=client.db('Eauto').collection('users')
    const usersInfoCollection=client.db('Eauto').collection('usersInfo')
    // Parts API
    app.get('/parts',async(req,res)=>{
        const query={}
        const cursor= partsCollection.find(query)
        const parts=await cursor.toArray()
        res.send(parts)
    })

// Al user API
app.get('/user',verifyJWT,async(req,res)=>{
  const users=await usersCollection.find().toArray();
  res.send(users)

})
// Admin API
app.get('/admin/:email',async(req,res)=>{
  const email=req.params.email
  const user=await usersCollection.findOne({email:email})
  const isAdmin=user.role==='admin'
  res.send({admin:isAdmin})
})
app.put('/user/admin/:email',verifyJWT,async(req,res)=>{
  const email=req.params.email;
  const requester=req.decoded.email
  const requesterAccount=await usersCollection.findOne({email:requester})
  if(requesterAccount.role==='admin'){
    const filter={email:email}
 
    const updateDoc={
        $set:{role:'admin'}
           
}
const result=await usersCollection.updateOne(filter,updateDoc)
   res.send(result);
  }
  else{
    res.status(403).send({message:'forbidden'})
  }
  

})
    // User API
    app.put('/user/:email',async(req,res)=>{
      const email=req.params.email;
      const user=req.body
      const filter={email:email}
      const option={upsert:true}
        const updateDoc={
            $set:user
               
    }
    const result=await usersCollection.updateOne(filter,updateDoc,option)
    const accessKey=jwt.sign(user,process.env.ACCESS_KEY,{
      expiresIn:'1d'
    })
       res.send({result,accessKey});

    })
    // Parts API By Id
    app.get('/parts/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id:ObjectId(id)}
        const singleParts=await partsCollection .findOne(query)
        res.send( singleParts)

    })

    //Order Collection API

 app.get('/order/:email', verifyJWT,async(req,res)=>{
    const decodedEmail=req.decoded.email
     const email=req.params.email
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
 app.get('/order',async(req,res)=>{
   const order=await orderCollection.find().toArray()
   res.send(order)
 })

 app.post('/order',async(req,res)=>{
    const order=req.body
    const result= await orderCollection.insertOne(order)
    res.send(result)
  })

  app.post('/userInfo',async(req,res)=>{
    const user=req.body
    const result= await usersInfoCollection.insertOne(user)
    res.send(result)
  })

  //Auth
// app.post('/login',async(req,res)=>{
//     const user=req.body
//     const accessKey=jwt.sign(user,process.env.ACCESS_KEY,{
//       expiresIn:'1d'
//     })
//     res.send(accessKey)
//   })

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