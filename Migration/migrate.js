// require("dotenv").config();
require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/"
const Problem = require("../models/Problem")

console.log(dbUrl);

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

const migrateDatabase = async () => {
    try {
        console.log("Starting Database Migration...");

        const result = await Problem.updateMany(
            { $or: [{ topic: { $exists: false } }, { difficulty: { $exists: false } }] },
            {
                $set: {
                    topic: ["General"],
                    difficulty: "easy",
                }
            }
        );

        console.log("Migration Completed: Added missing 'track' fields.");

        mongoose.connection.close();
    } catch (error) {
        console.error("Migration Error:", error);
        mongoose.connection.close();
    }
}

migrateDatabase();