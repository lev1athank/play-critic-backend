import mongoose, { Document, Schema, Types } from "mongoose";


interface IGame extends Document {
    _id: Types.ObjectId;
    appid: number;
    name: string;
}

const gameSchema = new Schema<IGame>({
    appid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
});



const FindsGame = mongoose.model<IGame>("allgame", gameSchema);

export const gameFinds = FindsGame;
