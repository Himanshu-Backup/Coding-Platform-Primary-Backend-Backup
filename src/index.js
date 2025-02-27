require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const axios = require("axios")

//Routes
const authRoutes = require("../routes/auth")
const problemRoutes = require("../routes/problem")
const submissionRoutes = require("../routes/submission")
const contestRoute = require("../routes/contest")
const tracksRoute = require("../routes/track")



const app = express();
const PORT = process.env.PORT || 8080
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/"

console.log(dbUrl)


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


app.use('/api/user', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use("/api/contests", contestRoute);
app.use("/api/tracks", tracksRoute);

//Routes
app.get("/", (req, res) => {
    res.status(200).send("This is the response from the Primary Backend");
})

const backendURL = process.env.Backend_URL;

setInterval(() => {
    axios.get(`${backendURL}`)
        .then(response => {
            console.log('Pinged backend to keep it alive.');
        })
        .catch(error => {
            console.error('Error pinging backend:', error);
        });
}, 2 * 60 * 1000);

app.listen(PORT, (req, res) => {
    console.log(`Server listening on PORT ${PORT}`)
})
