const Problem = require('../models/Problem');

const getProblemsMappedToTrack = async (req, res) => {
    const trackName = req.params.trackName;

    if (!trackName) {
        return res.status(404).json({ message: "Track Name is not provided" });
    }

    const mapping = {
        "dsa": 1,
        "cp": 2,
        "interview": 3
    };

    const trackNumber = mapping[trackName.toLowerCase()];

    if (!trackNumber) {
        return res.status(400).json({ message: "Invalid track name. Use 'dsa', 'cp', or 'interview'." });
    }

    try {
        const problems = await Problem.find({ track: trackNumber }, 'title _id');
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: "Error fetching problems", error: error.message });
    }
};

// Define the route
module.exports = {
    getProblemsMappedToTrack
}