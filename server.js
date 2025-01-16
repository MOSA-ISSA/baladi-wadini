const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const userModule = require('./userModules');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongooseLink = process.env.MONGO_URI || "mongodb+srv://baladi-wadini:baladi-wadini123@cluster0.rbu8f.mongodb.net/"
mongoose.connect(mongooseLink);

// When MongoDB is connected
mongoose.connection.on("connected", () => {
    console.log("Mongo connected");
});

// Error case
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// API Route for Registration
app.post('/api/register', (req, res) => {
    const { phoneNumber } = req.body;
    console.log("register-phoneNumber: ", phoneNumber);
    try {
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Enter your phone number' });
        } else {
            userModule.findOne({ phoneNumber: phoneNumber }).then((user) => {
                if (user) {
                    console.log(" 🟢 find user: ", user);
                    return res.status(200).json({ success: true, data: user, points: user.points.length });
                } else {
                    console.log(" 🟢 create user: ", user);
                    userModule.create({ phoneNumber: phoneNumber }).then((user) => {
                        return res.status(200).json({ success: true, data: user, points: 1 });
                    });
                }
            });
        }
    } catch (error) {
        console.error(" 🟥 error: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API Route to Add Points
app.post('/api/addPoint', (req, res) => {
    const { phoneNumber } = req.body;
    try {
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Enter your phone number' });
        } else {
            userModule.findOne({ phoneNumber: phoneNumber }).then((user) => {
                if (user) {
                    const now = new Date().getTime();
                    const timeWindow = Math.floor(now / 60000); // Time in minutes

                    // Check if the user already has a point in the same time window
                    const pointsInCurrentWindow = user.points.filter((point) => {
                        return Math.floor(point / 60000) === timeWindow;
                    });


                    if (pointsInCurrentWindow.length === 0) {
                        // Add point if it's a new time window
                        user.points.push(now);
                        user.save();
                        return res.status(200).json({ success: true, data: user, points: user.points.length });
                    } else {
                        return res.status(400).json({ message: 'لقد حصلت على نقطة في نفس الوقت' });
                    }
                } else {
                    return res.status(400).json({ message: 'يرجى التسجيل اولا' });
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API Route to Get All Users
app.post('/api/getAllUsers', (req, res) => {
    try {
        userModule.find().then((users) => {
            return res.status(200).json({ success: true, data: users });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

module.exports = app;