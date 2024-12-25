
// import mongoose from 'mongoose'
import express, { Request, Response } from 'express';
import { authRouter } from './src/Authorization/authorization.controller';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// mongoose.connect('mongodb://localhost:27017/mydatabase').then(() => console.log('MongoDB connected'));

app.use('/auth', authRouter);
  



app.listen(3452, () => console.log(`Server running on http://localhost:${3452}`));
