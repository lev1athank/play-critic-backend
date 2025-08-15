import { DBUserSchema } from "../DB/DbSchema/user";
import { UsersDataSchema } from "../DB/DbSchema/usersData";
import { createToken, verifyToken } from "../JWT/JWT_fun";
import { Ttokens, userData } from "./auth.type";

const result = (code: number = 401, message: string = "неизвестная ошибка"): {code: number, message: string} => ({
    code,
    message,
})

export class AuthService {
    public async login(data: userData): Promise<{code: number, message: string} | Ttokens> {
        const user = await DBUserSchema.findOne({
            login: data.login,
        });

        if (!user) return result(422, "Пользователь не найден");

        const verifyPassword = await user.comparePassword(data.password);

        if (!verifyPassword) return result(422, "Неверный пароль");

        const accessToken = createToken(
            user._id.toString(),
            user.login,
            "access"
        );
        const refreshToken = createToken(
            user._id.toString(),
            user.login,
            "refresh"
        );

        user.refreshToken = refreshToken; // Исправлено название поля
        await user.save();

        return {
            AccessToken: accessToken,
            RefreshToken: refreshToken,
        };
    }

    public async signup(data: userData): Promise<boolean | Ttokens> {
        try {
            const user = await DBUserSchema.create({
                login: data.login,
                password: data.password,
            });

            await UsersDataSchema.create({
                userId: user._id,
                descriptionProfile: "",
                loveGame: "",
                avatar: "",
                isCloseProfile: false,
            });

            const accessToken = createToken(
                user._id.toString(),
                data.login,
                "access"
            );
            const refreshToken = createToken(
                user._id.toString(),
                data.login,
                "refresh"
            );

            user.refreshToken = refreshToken;
            await user.save();

            return {
                AccessToken: accessToken,
                RefreshToken: refreshToken,
            };
        } catch (err) {
            console.error("Signup error:", err);
            return false;
        }
    }

    public async getRefreshToken(
        refreshToken: string
    ): Promise<boolean | Ttokens> {
        if (!refreshToken) return false;

        const payload = verifyToken(refreshToken, "refresh");

        if (!payload || typeof payload === "boolean") return false;

        const decodedPayload = payload;

        const user = await DBUserSchema.findById(decodedPayload.id);
        if (!user) return false;

        const isValidRefreshToken = user.refreshToken === refreshToken;
        if (!isValidRefreshToken) return false;

        const accessToken = createToken(
            user._id.toString(),
            user.login,
            "access"
        );
        const newRefreshToken = createToken(
            user._id.toString(),
            user.login,
            "refresh"
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        return {
            AccessToken: accessToken,
            RefreshToken: newRefreshToken,
        };
    }

    public async logout(accessToken: string): Promise<boolean> {
        let payload = verifyToken(accessToken, "access");
        try {
            if (!payload || typeof payload === "boolean") return false;
            const isLogin = await DBUserSchema.findByIdAndUpdate(payload.id, {
                $unset: { refreshToken: "" },
            });

            return true;
        } catch {
            return false;
        }
    }
}
