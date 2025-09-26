import { Request, Response, Router } from "express";
import { AuthService } from "./authorization.service";
import { createUserDto, loginUserDto } from "./auth.dto";
import { verifyToken } from "../JWT/JWT_fun";
import { DBUser } from "../DB/DbSchema/user";
import { Ttokens } from "./auth.type";

const router = Router();
const authService = new AuthService();

const setAuthCookies = (res: Response, tokens: Ttokens): void => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
    };

    res.cookie("accessToken", tokens.AccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 минут
    });

    res.cookie("refreshToken", tokens.RefreshToken, {
        ...cookieOptions,
        maxAge: 20 * 24 * 60 * 60 * 1000, // 20 дней
    });
};

/**
 * Удаляет auth токены
 */
const clearAuthCookies = (res: Response): void => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        expires: new Date(0),
    };

    res.cookie("accessToken", "", cookieOptions);
    res.cookie("refreshToken", "", cookieOptions);
};

// === LOGIN ===
router.post("/login", async (req: Request, res: Response): Promise<void> => {

    const validation = loginUserDto.safeParse(req.body);
    if (!validation.success) {
        res.status(422).json({ error: validation.error.errors[0] });
        return;
    }

    const tokens = await authService.login(validation.data);
    if (tokens && typeof tokens === "object" && "code" in tokens) {
        res.status(tokens.code).json({ error: tokens.message });
        return;
    }

    setAuthCookies(res, tokens);
    res.status(200).json({ message: "Login successful" });
});

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    const validation = createUserDto.safeParse(req.body);
    if (!validation.success) {
        res.status(422).json({ error: validation.error.errors[0] });
        return;
    }

    const { login, password } = validation.data;

    if (login === password) {
        res.status(422).json({ error: "Пароль не должен совпадать с логином" });
        return;
    }

    const existingUser = await DBUser.findOne({ login });
    if (existingUser) {
        res.status(422).json({ error: "Логин уже занят" });
        return;
    }

    const tokens = await authService.signup(validation.data);
    if (!tokens || typeof tokens !== "object") {
        res.status(500).json({ error: "Ошибка создания пользователя" });
        return;
    }

    setAuthCookies(res, tokens);
    res.status(200).json({ message: "Signup successful" })
});


router.get("/verify", async (req: Request, res: Response): Promise<void> => {
    let accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // Если accessToken отсутствует или просрочен, пробуем обновить через refreshToken
    if (!accessToken && refreshToken) {
        try {
            const tokens = await authService.getRefreshToken(refreshToken);
            if (!tokens || typeof tokens !== "object") {
                clearAuthCookies(res);
                res.status(401).json({ error: "Не удалось обновить токен" });
                return;
            }

            // Устанавливаем новые куки
            setAuthCookies(res, tokens);
            accessToken = tokens.AccessToken;
        } catch (err) {
            clearAuthCookies(res);
            res.status(401).json({ error: "Не авторизован" });
            return;
        }
    }

    if (!accessToken) {
        res.status(401).json({ error: "Токен отсутствует" });
        return;
    }

    // Проверяем accessToken
    const decoded = verifyToken(accessToken, "access");
    if (typeof decoded === "boolean") {
        res.status(401).json({ error: "Не авторизован" });
        return;
    }

    // Получаем пользователя из базы
    const user = await DBUser.findById(decoded.id);
    if (!user) {
        res.status(404).json({ error: "Пользователя не существует" });
        return;
    }

    res.status(200).json(user);
});

router.post("/refresh-token", async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ error: "Отсутствует refresh-token" });
        return;
    }

    const tokens = await authService.getRefreshToken(refreshToken);
    if (!tokens || typeof tokens !== "object") {
        clearAuthCookies(res);
        res.status(401).json({ error: "Неверный refresh-token" });
        return;
    }

    setAuthCookies(res, tokens);
    res.status(200).json({ message: "Access token refreshed" });
});
router.get("/logout", async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies?.accessToken;

    const success = await authService.logout(accessToken);
    if (!success) {
        res.status(400).json({ message: "Не удалось выйти" });
        return;
    }

    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
});


export const authRouter = router;