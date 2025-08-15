import mongoose, { Document, Schema, Types } from "mongoose";


interface IuserProfile extends Document {
    userId: Types.ObjectId;
    descriptionProfile: string;
    loveGame: string;
    avatar: string;
    isCloseProfile: boolean;
}

const userDataSchema = new Schema<IuserProfile>({
    userId: { type: Schema.Types.ObjectId, required: true },
    descriptionProfile: { type: String, required: false, default: "" },
    loveGame: { type: String, required: false, default: "" },
    avatar: { type: String, required: false, default: "" },
    isCloseProfile: { type: Boolean, required: false, default: false },

});



const usersData = mongoose.model<IuserProfile>("usersData", userDataSchema);

export const UsersDataSchema = usersData;
