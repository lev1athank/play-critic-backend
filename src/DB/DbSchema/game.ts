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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

gameSchema.post("save", async function (doc, next) {
    try {
        // ищем пользователя по userId, который был сохранён в игре
        await mongoose.model("User").findByIdAndUpdate(
            doc.userId,
            { $addToSet: { userGamesId: doc._id } }, // добавляем ссылку на игру
            { new: true }
        );
        next();
    } catch (err) {
        next(err as any);
    }
});

gameSchema.post("findOneAndDelete", async function (doc, next) {
  if (doc) {
    await mongoose.model("User").findByIdAndUpdate(
      doc.userId,
      { $pull: { userGamesId: doc._id } },
      { new: true }
    );
  }
  next();
});

const game = mongoose.model<IGame>("Game", gameSchema);

export const DBGamesSchema = game;
