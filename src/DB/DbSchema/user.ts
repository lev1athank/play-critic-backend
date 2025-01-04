import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
    _id: Types.ObjectId;
    login: string;
    password: string;
    refreshToken: string;
    comparePassword: (password: string) => Promise<boolean>;
    compareRefreshToken: (refreshToken: string) => Promise<boolean>;
    updateRefreshToken: (refreshToken: string) => void;
}

const userSchema = new Schema<IUser>({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, required: false },
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

userSchema.methods.compareRefreshToken = async function (oldRefreshToken: string):Promise<Boolean> {
  console.log(this.refreshToken);
  
    return oldRefreshToken == this.refreshToken
};

userSchema.methods.updateRefreshToken = async function (refreshToken: string) {
  this.refreshToken = refreshToken

}

const User = mongoose.model<IUser>("Users", userSchema);

export const DBUserSchema = User;
