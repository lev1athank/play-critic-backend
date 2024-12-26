
// import mongoose from 'mongoose'
import express, { Request, Response } from 'express';
import { authRouter } from './src/Authorization/authorization.controller';
import dotenv from 'dotenv';
import cors from 'cors'
dotenv.config();

const corsOptions = {
    methods: 'GET,POST', // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

app.use('/auth', authRouter);
  



app.listen(3452, () => console.log(`Server running on http://localhost:${3452}`));
