require("dotenv").config();
const express = require("express")

const app = express();
const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
    res.status(200).send("This is the response from the Primary Backend");
})

app.listen(PORT, (req, res) => {
    console.log(`Server listening on PORT ${PORT}`)
})
