
// import mongoose from 'mongoose'
import express from 'express';
import { authRouter } from './src/Authorization/authorization.controller';
import dotenv from 'dotenv';
import cors from 'cors'
import bodyParser from 'body-parser';
import { connectDB } from './src/DB/DB';
dotenv.config();

const corsOptions = {
    methods: 'GET,POST', // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors(corsOptions))

app.use('/auth', authRouter);
  



app.listen(3452, () => console.log(`Server running on http://localhost:${3452}`));
connectDB()
