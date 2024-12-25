import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "asd";

const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URI, 123);
         
        await mongoose.connect(MONGO_URI);
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
