require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express();
const PORT = process.env.PORT || 8080
const dbUrl = process.env.DB_URL


//Connect to Database
async function connectToMongo() {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(dbUrl);
        console.log("Successfully connected to MongoDB database");
        console.log("Connected to database:", mongoose.connection.name); // Logs the database name
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}


connectToMongo().catch(err => console.log("Some error"));

//Middlewares
app.use(cors());
app.use(express.json());


//Routes
app.get("/", (req, res) => {
    res.status(200).send("This is the response from the Primary Backend");
})

app.listen(PORT, (req, res) => {
    console.log(`Server listening on PORT ${PORT}`)
})
