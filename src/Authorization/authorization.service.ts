import { DBUser } from "../DB/DbSchema/user";
import { createToken, verifyToken } from "../JWT/JWT_fun";
import { AUTuserData, REGuserData, Ttokens } from "./auth.type";

const result = (code: number = 401, message: string = "неизвестная ошибка"): { code: number, message: string } => ({
    code,
    message,
})

export class AuthService {
    public async login(data: AUTuserData): Promise<{ code: number, message: string } | Ttokens> {

        console.log(data);
        
        const user = await DBUser.findOne({
            login: data.login,
        }).select("+password");

        if (!user) return result(422, "Пользователь не найден");

        const verifyPassword = await user.comparePassword(data.password);

        if (!verifyPassword) return result(422, "Неверный пароль");

        const accessToken = createToken(
            (user._id as string).toString(),
            user.login,
            "access"
        );
        const refreshToken = createToken(
            (user._id as string).toString(),
            user.login,
            "refresh"
        );

        user.userName = user.userName
        user.refreshToken = refreshToken; // Исправлено название поля
        await user.save();

        return {
            AccessToken: accessToken,
            RefreshToken: refreshToken,
        };
    }

    public async signup(data: REGuserData): Promise<boolean | Ttokens> {
        try {
            // Создаём пользователя и профиль в одной транзакции
            const user = await DBUser.createUserWithProfile(
                data.login,
                data.userName,
                data.password
            );

            // Создаём токены
            const accessToken = createToken((user._id as string).toString(),  data.login, "access");
            const refreshToken = createToken((user._id as string).toString(), data.login, "refresh");

            // Обновляем refreshToken в документе пользователя
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

        const user = await DBUser.findById(decodedPayload.id).select("+refreshToken");
        if (!user) return false;

        const isValidRefreshToken = user.refreshToken === refreshToken;
        if (!isValidRefreshToken) return false;

        const accessToken = createToken(
            (user._id as string).toString(),
            user.login,
            "access"
        );
        const newRefreshToken = createToken(
            (user._id as string).toString(),
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
            const isLogin = await DBUser.findByIdAndUpdate(payload.id, {
                $unset: { refreshToken: "" },
            });

            return true;
        } catch {
            return false;
        }
    }
}
