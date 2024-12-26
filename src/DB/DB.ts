import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "";

const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URI, 123);
         
        await mongoose.connect(MONGO_URL);
        console.log("Database connected");
    } catch (err) {
        console.error(err);
    }
}; 

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("Database disconnected");
    } catch (err) {
        console.error(err);
    }
};

export { connectDB, disconnectDB };
