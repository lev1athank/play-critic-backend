import { searchRouter } from './src/Search/search.controller';
// import mongoose from 'mongoose'
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authRouter } from './src/Authorization/authorization.controller';
import bodyParser from "body-parser";
import { connectDB } from "./src/DB/DB";
import cookieParser from 'cookie-parser';
import { authentication } from './src/middleware/authentication';
import { gameRouter } from './src/Game/game.controller';
dotenv.config();

const corsOptions = {
    origin: "http://localhost:3000", // точно твой frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser())

app.use(cors(corsOptions))

app.use("/auth", authRouter)
app.use("/api", authentication, gameRouter, searchRouter)
// app.use("/api", gameRouter)

app.listen(3452, () =>
    console.log(`Server running on http://localhost:${3452}`)
);
connectDB();
