import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
    _id: Types.ObjectId;
    login: string;
    password: string;
    refrashToken: string;
    comparePassword: (password: string) => Promise<boolean>;
    compareRefrashToken: (refrashToken: string) => Promise<boolean>;
    updateRefrashToken: (refrashToken: string) => void;
}

const userSchema = new Schema<IUser>({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refrashToken: { type: String, required: false },
});

userSchema.pre<IUser>("save", async function (next) {
  try {
      if (this.isModified("password")) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
      }
      next();
  } catch (err) {
      next();
  }
})

userSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.compareRefrashToken = async function (oldRefrashToken: string):Promise<Boolean> {
  console.log(this.refrashToken);
  
    return oldRefrashToken == this.refrashToken
};

userSchema.methods.updateRefrashToken = async function (refrashToken: string) {
  this.refrashToken = refrashToken

}

const User = mongoose.model<IUser>("Users", userSchema);

export const DBUserSchema = User;
