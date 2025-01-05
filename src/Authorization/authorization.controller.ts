import { Request, Response, Router } from "express";
import { AuthService } from "./authorization.service";
import { createUserDto } from "./auth.dto";
import { verifyToken } from "../JWT/JWT_fun";
import { DBUserSchema } from "../DB/DbSchema/user";
import { Ttokens, userData } from "./auth.type";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    const validation = createUserDto.safeParse(req.body);
    if (!validation.success)
        return res.status(422).json(validation.error.errors[0]);

    let tokens = await authService.login(validation.data);
    if (!tokens) return res.status(402).send("неверный логин или пароль");
    tokens = tokens as Ttokens;
    res.cookie("accessToken", tokens.AccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 50 * 1000, // 15 min
    });
    res.cookie("refreshToken", tokens.RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 day
    });
    return res.status(200).json({ message: "Login successful" });
});

router.post("/singup", async (req: Request, res: Response): Promise<any> => {
    const validation = createUserDto.safeParse(req.body);

    if (validation.data?.password == validation.data?.login)
        return res.status(422).send("pass = login");
    if (!validation.success)
        return res.status(422).json(validation.error.errors[0]);

    const isLogin = await DBUserSchema.findOne({
        login: validation.data.login,
    });
    if (isLogin) return res.status(422).send("логин занят");

    let tokens = await authService.signup(validation.data);
    if (!tokens) return res.status(401).send("неверный токен");
    tokens = tokens as Ttokens;
    res.cookie("accessToken", tokens.AccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 50 * 1000, // 15 min
    });
    res.cookie("refreshToken", tokens.RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 day
    });
    return res.status(200).json(tokens);
});

router.get("/verify", (req: Request, res: Response): any => {
    const accessToken: string = req.cookies.accessToken;

    const decoded = verifyToken(accessToken, "access");
    if (!decoded) return res.status(401).send("не авторизован");
    return res.status(200).json(decoded);
});

router.post(
    "/refresh-token",
    async (req: Request, res: Response): Promise<any> => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken)
            return res.status(202).send("отсутствует refresh-token");
        let tokens = await authService.getRefreshToken(refreshToken);
        if (!tokens) return res.status(422).send("не верный refresh-token");
        tokens = tokens as Ttokens;
        res.cookie("accessToken", tokens.AccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 50 * 1000, // 15 min
        });
        res.cookie("refreshToken", tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 day
        });
        return res.status(200).json({ message: "Access token refreshed" });
    }
);

router.get("/logout", async (req: Request, res: Response) => {
    const accessToken: string = req.cookies.accessToken;
    
    const isDel = await authService.logout(accessToken);
    if (!isDel) res.status(202).json({ message: "failed logout" });
    res.cookie("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
    });

    res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
});

export const authRouter = router;
