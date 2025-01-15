const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const userModule = require('./userModules');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongooseLink = "mongodb+srv://baladi-wadini:baladi-wadini123@cluster0.rbu8f.mongodb.net/"
mongoose.connect(mongooseLink);

// When MongoDB is connected
mongoose.connection.on("connected", () => {
    console.log("Mongo connected");
});

// Error case
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Time-based point system
function isWithinAllowedTime(testDate) {
    const now = new Date();
    const nowInMinutes = now.getHours() * 60 + now.getMinutes(); // current time in minutes

    // Get the test date time in minutes (if no test date, use current time)
    const testTimeInMinutes = testDate ? testDate.getHours() * 60 + testDate.getMinutes() : nowInMinutes;

    // Define allowed time ranges (in minutes)
    const allowedTimes = [
        [290, 360],  // 4:50 AM - 6:00 AM
        [690, 780],  // 11:30 AM - 1:00 PM
        [855, 915],  // 2:15 PM - 3:15 PM
        [1005, 1065], // 5:00 PM - 6:05 PM
        [1065, 1150], // 6:05 PM - 7:40 PM
    ];

    // Check if the given time is within any of the allowed ranges
    return allowedTimes.some(
        ([start, end]) => testTimeInMinutes >= start && testTimeInMinutes <= end
    );
};

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
                    // Check if the user is within the allowed time
                    if (isWithinAllowedTime()) {
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
                        return res.status(400).json({ message: 'التسجيل مسموح فقط خلال اوقات الصلاة' });
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
