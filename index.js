const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

// verify jwt

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    console.log('veiieie', authHeader);
    next()

}

// connetion to db


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wgy7w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();

        const productCollection = client.db('fruityGarden').collection('product');

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query);
            res.send(product)
        })

        app.put('/product', async (req, res) => {
            const id = req.body._id;
            const updatedUser = req.body;
            console.log(updatedUser);
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedUser.quantity
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options)
            res.send(result)

        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result)
        })

        app.post('/product', async (req, res) => {
            const doc = req.body;
            console.log(req.body);
            const result = await productCollection.insertOne(doc);
            res.send(result)
        })

        // for auth

        app.post('/login', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCSESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ token })
        })

    }
    finally {
        // client.close()
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('fruity garden server is running')
})

// app.get('/product', (req, res) => {

// })


app.listen(port, () => {
    console.log('furity port is', port);
})