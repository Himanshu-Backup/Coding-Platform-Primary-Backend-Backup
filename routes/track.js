const express = require('express');
const router = express.Router();
const { getProblemsMappedToTrack } = require("../controllers/tracksController")

router.get("/:trackName", getProblemsMappedToTrack);

module.exports = router;