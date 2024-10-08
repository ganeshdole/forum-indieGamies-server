const mongoose = require('mongoose');
const url = process.env.DB_URL ||  "mongodb://127.0.0.1:27017/";
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        conn.connection.on('error', err => {
            console.error(`MongoDB connection error: ${err}`);
        });

        conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;