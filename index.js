const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


//middleWere
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Car Toys is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uekqjhq.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((error) => {
            if (error) {
                console.error(error);
                return;
            }
        });

        const toyDataCollection = client.db('toyCars').collection('toyData')

        app.get('/alltoy', async (req, res) => {
            const cursor = toyDataCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        //get
        app.get("/mytoy", async (req, res) => {
            console.log(req.query.email)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
                console.log(query)
            }
            const result = await toyDataCollection.find(query).toArray();
            res.send(result);
        });

        // get 
        app.get('/alltoy/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await toyDataCollection.findOne(query);
            res.send(result)
        })

        //post
        app.post('/alltoy', async (req, res) => {
            const allData = req.body
            console.log(allData)
            const result = await toyDataCollection.insertOne(allData)
            res.send(result)
        })

        //patch
        app.patch('/alltoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updateData = req.body
            const updateToy = {
                $set: {
                    price: updateData.price,
                    quantity: updateData.quantity,
                    description: updateData.description,
                },
            }
            const result = await toyDataCollection.updateOne(query, updateToy, options)
            res.send(result)
        })

        //delete
        app.delete('/alltoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyDataCollection.deleteOne(query)
            res.send(result)
        })

        app.get("/category", async (req, res) => {
            const myTextCategory = req.query.subCategory;
            console.log(myTextCategory)
            const query = { subCategory: myTextCategory };
            const result = await toyDataCollection.find(query).limit(2).toArray();
            res.send(result);
        });

        app.get("/search", async (req, res) => {
            const search = req.query.sellerName;
            const query = { sellerName: search };
            const result = await toyDataCollection.find(query).toArray();
            res.send(result);
        });



        app.get("/sort", async (req, res) => {
            const email = req.query.email;
            const sort = req.query.sort;

            let query = { email: email }
            if (sort === "ascending") {
                const result = await toyDataCollection
                    .find(query)
                    .sort({ price: 1 })
                    .toArray();
                res.send(result);
            } else if (sort === "descending") {
                const result = await toyDataCollection
                    .find(query)
                    .sort({ price: -1 })
                    .toArray();
                res.send(result);
            }
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, (req, res) => {
    console.log(`Car toys port ${port}`)
})