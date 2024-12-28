import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "";

const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URL, 123);
         
        return await mongoose.connect(MONGO_URL);
    } catch (err) {
        console.error(err);
    }
}; 

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

export { connectDB, disconnectDB };
