import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

// ==========================
// UserProfile (профиль пользователя)
// ==========================
interface IUserProfile extends Document {
    userId: Types.ObjectId;
    descriptionProfile: string;
    loveGame: number[];
    avatar: string;
    isCloseProfile: boolean;
}

const userProfileSchema = new Schema<IUserProfile>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    descriptionProfile: { type: String, default: "" },
    loveGame: { type: [Number], default: [] },
    avatar: { type: String, default: "" },
    isCloseProfile: { type: Boolean, default: false },
});

const UserProfile = mongoose.model<IUserProfile>("UserProfile", userProfileSchema);

// ==========================
// User
// ==========================
interface IUser extends Document {
    login: string;
    userName: string;
    avatar: string;
    profileId: Types.ObjectId;
    userGamesId: Types.ObjectId[];
    password: string;
    refreshToken?: string;
    comparePassword: (password: string) => Promise<boolean>;
    compareRefreshToken: (refreshToken: string) => boolean;
    updateRefreshToken: (refreshToken: string) => Promise<void>;
    createUserWithProfile: (login: string, userName: string, password: string) => Promise<any>;
}
interface IUserModel extends mongoose.Model<IUser> {
    createUserWithProfile: (login: string, userName: string, password: string) => Promise<IUser>;
}

const userSchema = new Schema<IUser>({
    login: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    avatar: { type: String, default: "" },
    profileId: { type: Schema.Types.ObjectId, ref: "UserProfile" },
    userGamesId: [{ type: Schema.Types.ObjectId, ref: "Game", default: [] }],
    password: { type: String, required: true, select: false },
    refreshToken: { type: String, select: false },
});

// Хешируем пароль перед сохранением
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
});

// Методы
userSchema.methods.comparePassword = async function (password: string) {
    console.log(this.password);
    
    return bcrypt.compare(password, this.password);
};

userSchema.methods.compareRefreshToken = function (oldRefreshToken: string) {
    return oldRefreshToken === this.refreshToken;
};

userSchema.methods.updateRefreshToken = async function (refreshToken: string) {
    this.refreshToken = refreshToken;
    await this.save();
};

// ==========================
// Создание пользователя с транзакцией
// ==========================
userSchema.statics.createUserWithProfile = async function (
    login: string,
    userName: string,
    password: string
) {


    try {
        // 1. Создаём пользователя
        const user = new this({ login, userName, password });
        await user.save();

        // 2. Создаём профиль для пользователя
        const profile = new UserProfile({ userId: user._id });
        await profile.save();

        // 3. Сохраняем ссылку на профиль в поле profileId пользователя
        user.profileId = profile._id as Types.ObjectId;
        await user.save();

        return user;
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

// ==========================
// Экспорт
// ==========================
export { User as DBUser, UserProfile as DBUserProfile };
