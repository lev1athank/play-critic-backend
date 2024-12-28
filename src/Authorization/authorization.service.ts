import { DBUserSchema } from "../DB/DbSchema/user";
import { createToken, verifyToken } from "../JWT/JWT_fun";
import { JwtPayload } from "jsonwebtoken";

type Ttokens = {
    "Access_token": string;
    "Refresh_token": string;
};

export class AuthService {

	public async login(data: userData): Promise<Boolean | Ttokens> {
		const user = await DBUserSchema.findOne({
			login: data.login
		})
		if(!user) return false

		const verifyPassword = await user.comparePassword(data.password)
		if(!verifyPassword) return false

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
        user.refrashToken = refreshToken;
        await user.save();

		return {
            "Access_token": accessToken,
            "Refresh_token": refreshToken,
        };

	}

    public async singup(data: userData): Promise<Boolean | Ttokens> {
        try {
            const user = await DBUserSchema.create({
                login: data.login,
                password: data.password,
            });
            const jwtAccess = createToken(
                user._id.toString(),
                data.login,
                "access"
            );
            const jwtRefresh = createToken(
                user._id.toString(),
                data.login,
                "refresh"
            );

            user.refrashToken = jwtRefresh;
            await user.save();
            return {
                "Access_token": jwtAccess,
                "Refresh_token": jwtRefresh,
            };
        } catch (err) {
            return false;
        }
    }

    public async getRefrashToken(
        oldRefreshToken: string
    ): Promise<Boolean | Ttokens> {
        let payload = verifyToken(oldRefreshToken, "refresh");
		
        if (!payload || typeof payload === "boolean") return false;

        payload = payload as JwtPayload;

        const user = await DBUserSchema.findById(payload.id);
		if (!user) return false

		const isValidRefreshToken = await user.compareRefrashToken(oldRefreshToken);
		console.log(isValidRefreshToken);
		
		if (!isValidRefreshToken) return false; 

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
        user.refrashToken = refreshToken;
        await user.save();

        return {
            "Access_token": accessToken,
            "Refresh_token": refreshToken,
        };
    }
}
