import mongoose, { Document, Schema, Types } from "mongoose";


interface IGame extends Document {
    userId: Types.ObjectId;
    appid: number;
    name: string;
    story: number;
    gameplay: number;
    originality: number;
    immersion: number;
    description: string;
    status: string;
    createdAt: Date;
}

const gameSchema = new Schema<IGame>({
    userId: { type: Schema.Types.ObjectId, required: true },
    appid: { type: Number, required: true },
    name: { type: String, required: true },
    story: { type: Number, required: true },
    gameplay: { type: Number, required: true },
    originality: { type: Number, required: true },
    immersion: { type: Number, required: true },
    description: { type: String, required: false },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});



const game = mongoose.model<IGame>("game", gameSchema);

export const DBGamesSchema = game;
