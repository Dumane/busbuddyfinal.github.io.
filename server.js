const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI; // Store your connection string in .env
let client;

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// API endpoint to fetch bus data
app.get('/api/buses', async (req, res) => {
  try {
    const database = client.db('BusDatabase');
    const buses = database.collection('buses');
    const busData = await buses.find({}).toArray();
    res.json(busData);
  } catch (error) {
    console.error('Error fetching bus data:', error);
    res.status(500).json({ error: 'Error fetching bus data' });
  }
});

// Start the server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server running on port ${port}`);
});