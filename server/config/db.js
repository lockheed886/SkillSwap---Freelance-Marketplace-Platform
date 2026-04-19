// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Ensure dotenv is configured early

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true); // Prepare for Mongoose 7 default
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Not needed in Mongoose 6+
            // useFindAndModify: false // Not needed in Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;