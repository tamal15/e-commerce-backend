// e-commerce-site
// jxjFr9MI4pLrJS0s
const express= require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
// const SSLCommerzPayment = require('sslcommerz')
const { v4: uuidv4 } = require("uuid");
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require("cors");

const app=express();
const port = process.env.PORT || 5000;
const SSLCommerzPayment = require('sslcommerz')
// app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.utq7asn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try{
        await client.connect();
        console.log("connected to database");
        const database = client.db('e-commerce');
        const buyerCollection = database.collection('buyerProduct');
        const potterCollection = database.collection('buyerPotter');
        const userCollection = database.collection('users');
        const likeCollection = database.collection('like');
        const paymentCollection = database.collection('payment');
        const featuresCollection = database.collection('features');
        const fashionCollection = database.collection('fashion');


        
    //    post product buyer 
        app.post('/postBuyer', async(req,res) =>{
            const user=req.body;
          console.log(user);
          
            const result=await buyerCollection.insertOne(user);
            res.json(result)
        });

        app.get('/postBuyer', async(req,res)=>{
            const result=await buyerCollection.find({}).toArray()
            res.json(result)
        });

        // potter post 

        app.post('/postPotter', async(req,res) =>{
            const user=req.body;
          console.log(user)
            // console.log(like)
            const result=await potterCollection.insertOne(user);
            res.json(result)
        });

        // get potter 

        app.get("/getPotter", async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const query = req.query;
            delete query.page
            delete query.size
            Object.keys(query).forEach(key => {
                if (!query[key])
                    delete query[key]
            });
    
            if (Object.keys(query).length) {
                const cursor = potterCollection.find(query, status = "approved");
                const count = await cursor.count()
                const allQuestions = await cursor.skip(page * size).limit(size).toArray()
                res.json({
                    allQuestions, count
                });
            } else {
                const cursor = potterCollection.find({
                    // status: "approved"
                });
                const count = await cursor.count()
                const allQuestions = await cursor.skip(page * size).limit(size).toArray()
    
                res.json({
                    allQuestions, count
                });
            }
    
        });


        // update like 
        app.post('/like/:id', async(req,res)=>{
            const id=req.params.id;
            // console.log(id)
            const updateLike=req.body;
            const like=[updateLike.email]
            // const likes=[updateLike.email]
            console.log(updateLike)
            const filter={_id: ObjectId(id)};
            // const filter= {email:updateLike.email}
            // const options={upsert:false};
            const updateDoc={
                $set:{
                    likeed:like

                }
            }
            const result=await potterCollection.updateOne(filter,updateDoc);
            res.json(result)

        })

        app.get('/likes', async(req,res)=>{
            const result=await likeCollection.find({}).toArray()
            res.json(result)
        });
        

         // update product

    // app.put('/updateProduct/:id', async(req,res)=>{
    //     const  id= req.params.id;
    //     const updateUser=req.body;
    //     const filter={_id: ObjectId(id)};
    //     const options={upsert:true};

    //     const updateDoc={
    //         $set:{
    //             productName:updateUser.productName
    //             // ProductPrice:ProductPrice
    //         }
    //     }
    //     const result=await potterCollection.updateOne(filter,updateDoc,options);
    //     res.json(result)
    // })

    app.put("/updateProduct/:id", async (req, res) => {

        const id=req.params.id;
        const updateUser=req.body
        console.log(updateUser)
        const filter={_id: ObjectId(id)};
        const options={upsert:true};

        const updateDoc={
            $set:{
                productName:updateUser.productName,
                ProductPrice:updateUser.ProductPrice
            }
        }
        const result=await buyerCollection.updateOne(filter,updateDoc,options);
        console.log('uodateinf',id);
        res.json(result)

    })

    app.get('/update/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const user=await buyerCollection.findOne(query)
        res.json(user)
    })
   
     

        // details show product 
        app.get('/product/:id', async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await buyerCollection.findOne(query)
            res.json(result)
        });


          // add database user collection 
          app.post('/users', async(req,res)=>{
            const user=req.body;
            console.log(user)
            const result=await userCollection.insertOne(user);
            // console.log(body)
            res.json(result);
           
        })

        

        app.put('/users', async(req,res) =>{
            const user=req.body;
            console.log(user)
            const filter= {email:user.email}
            const option = {upsert:true}
            const updateDoc= {$set : user}
            const result= await userCollection.updateOne(filter,updateDoc,option)
            res.json(result)
        });

        // database searching check buyer
    app.get('/users/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const user=await userCollection.findOne(query)
        let isbuyer=false;
        if(user?.client==='buyer'){
          isbuyer=true;
        }
        res.json({buyer:isbuyer})
    });
       
    // database admin role 
    app.put('/userLogin/admin', async(req,res)=>{
        const user=req.body;
        console.log('put',user)
        const filter={email:user.email}
        const updateDoc={$set:{role:'admin'}}
        const result=await userCollection.updateOne(filter,updateDoc)
        res.json(result)
    });

       // database searching check admin 
       app.get('/userLogin/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const user=await userCollection.findOne(query)
        let isAdmin=false;
        if(user?.role==='admin'){
          isAdmin=true;
        }
        res.json({admin:isAdmin})
    });

    // update profile 

    app.put('/updateUser', async(req,res)=>{
        const user=req.body;
        const query={email:user.email}
        const updateDoc={
            $set:{
                address:user.address,
                mobile:user.mobile
            }
        }
        const result=await userCollection.updateOne(query,updateDoc);
        res.json(result)
    })

      // user profile email 
      app.get('/updateUser/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email};
        const result=await userCollection.findOne(query)
        res.json(result)
    });

         // post review the database 
    // app.post("/review", async (req, res) => {
    //     const review = req.body;
    //     const result = await userReviewCollection.insertOne(review);
    //     res.json(result);
    // });

        // get resview 
    // app.get('/review', async(req,res)=>{
    //     const result=await userReviewCollection.find({}).toArray()
    //     res.json(result)
    // })


    // get sharee 
    app.get("/sharee", async (req, res) => {
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const query = req.query;
        delete query.page
        delete query.size
        Object.keys(query).forEach(key => {
            if (!query[key])
                delete query[key]
        });

        if (Object.keys(query).length) {
            const cursor = buyerCollection.find(query, status = "approved");
            const count = await cursor.count()
            const allQuestions = await cursor.skip(page * size).limit(size).toArray()
            res.json({
                allQuestions, count
            });
        } else {
            const cursor = buyerCollection.find({
                // status: "approved"
            });
            const count = await cursor.count()
            const allQuestions = await cursor.skip(page * size).limit(size).toArray()

            res.json({
                allQuestions, count
            });
        }

    });





    // delete book 
    app.delete('/deleteProduct/:id',async(req,res)=>{
        const result= await buyerCollection.deleteOne({_id:ObjectId(req.params.id)});
        res.json(result)
    });


    //sslcommerz init


    // const likes=[{type:ObjectId}]
    // app.put('/buyer/:id',async(req,res)=>{
    //     const id=req.params.id;
    //     const like=req.body;
    //     const query={_id:ObjectId(id)}
        
    //     const updateDoc=[{
    //       $set:{
    //        {like:req.user._id}
    //       }
    //     }]
    //     const result=await buyerCollection.updateOne(query,updateDoc)
    //     res.json(result)
    //   })


    // customer payment store datbase 
    // app.post('/init', async(req,res)=>{
    //     const user=req.body;
    //     console.log(user)
    //     const result=await paymentCollection.insertOne(user);
    //     // console.log(body)
    //     res.json(result);
       
    // })
      

    //sslcommerz init
app.post('/init', async(req, res) => {
    // console.log(req.body)
    // const email=req.body.cartProducts.map((data)=>console.log(data.buyerEmail))
    // console.log()
    const data = {
        total_amount: req.body.total_amount,
        currency: req.body.currency,
        tran_id: uuidv4(),
        success_url: 'http://localhost:5000/success',
        fail_url: 'http://localhost:5000/fail',
        cancel_url: 'http://localhost:5000/cancel',
        ipn_url: 'http://yoursite.com/ipn',
        shipping_method: 'Courier',
        product_name: "req.body.product_name",
        product_category: 'Electronic',
        product_profile: "req.body.product_profile",
        cus_name: req.body.cus_name,
        cus_email: req.body.cus_email,
        date: req.body.date,
        
        status: req.body.status,
        cartProducts: req.body.cartProducts,
        buyerDetails: req.body.cartProducts.map((data)=>console.log(data.buyerEmail)),
        // buyerDetails: req.body.console.log(cartProducts),
        product_image: "https://i.ibb.co/t8Xfymf/logo-277198595eafeb31fb5a.png",
        cus_add1: req.body.cus_add1,
        cus_add2: 'Dhaka',
        cus_city: req.body.cus_city,
        cus_state:  req.body.cus_state,
        cus_postcode: req.body.cus_postcode,
        cus_country: req.body.cus_country,
        cus_phone: req.body.cus_phone,
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
        multi_card_name: 'mastercard',
        value_a: 'ref001_A',
        value_b: 'ref002_B',
        value_c: 'ref003_C',
        value_d: 'ref004_D'
    };
    // insert order data into database 
    const order=await paymentCollection.insertOne(data)
    // console.log(data)
    const sslcommer = new SSLCommerzPayment(process.env.STORE_ID,process.env.STORE_PASSWORD,false) //true for live default false for sandbox
    sslcommer.init(data).then(data => {
        //process the response that got from sslcommerz 
        //https://developer.sslcommerz.com/doc/v4/#returned-parameters
        // console.log(data);
        // res.redirect(data.GatewayPageURL)
        if(data.GatewayPageURL){
            res.json(data.GatewayPageURL)
          }
          else{
            return res.status(400).json({
              message:'payment session failed'
            })
          }
    });
})

app.post('/success',async(req,res)=>{
    // console.log(req.body)
    const order = await paymentCollection.updateOne({tran_id:req.body.tran_id},{
        $set:{
          val_id:req.body.val_id
        }
    
      })
    res.status(200).redirect(`http://localhost:3000/success/${req.body.tran_id}`)
    // res.status(200).json(req.body)
})

app.post ('/fail', async(req,res)=>{
    // console.log(req.body);
  const order=await paymentCollection.deleteOne({tran_id:req.body.tran_id})
    res.status(400).redirect('http://localhost:3000')
  })
  app.post ('/cancel', async(req,res)=>{
    // console.log(req.body);
    const order=await paymentCollection.deleteOne({tran_id:req.body.tran_id})
    res.status(200).redirect('http://localhost:3000')
  })


  app.get('/orders/:tran_id', async(req,res)=>{
    const id=req.params.tran_id;
    const order =await paymentCollection.findOne({tran_id:id});
    console.log(order)
    res.json(order)
  });

//   client order and single mail 
// email get my Order==============================================
 // get myorder 
 app.get("/myOrder/:email", async (req, res) => {
    console.log(req.params.email);
    const email = req.params.email;
    const result = await paymentCollection
      .find({ cus_email: email })
      .toArray();
    res.send(result);
  });

  //   delete api myorder 
//   app.delete('/deleteOrder/:id', async(req,res)=>{
//     const result=await myOrderCollection.deleteOne({_id:ObjectId(req.params.id)});
//     res.json(result)
// })

  // my order delete ----------
// Delete manage all product ----------
app.delete("/manageAllOrderDelete/:id", async (req, res) => {
    const result = await paymentCollection.deleteOne({_id:ObjectId(req.params.id)});
    res.send(result);
  });


//   post features product 
//    post product buyer 
// app.post('/PostFeatures', async(req,res) =>{
//     const user=req.body;
//   console.log(user);
  
//     const result=await featuresCollection.insertOne(user);
//     res.json(result)
// });

app.post('/features',async(req,res)=>{
    const value=req.body;
    console.log(value)
    const output=await featuresCollection.insertOne(value);
    res.json(output)
});

app.get('/features', async(req,res)=>{
    const result=await featuresCollection.find({}).toArray()
    res.json(result)
});

app.post('/fashion',async(req,res)=>{
    const value=req.body;
    console.log(value)
    const output=await fashionCollection.insertOne(value);
    res.json(output)
});

app.get('/fashion', async(req,res)=>{
    const result=await fashionCollection.find({}).toArray()
    res.json(result)
});

       

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