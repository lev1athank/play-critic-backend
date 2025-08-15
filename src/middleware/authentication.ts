import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../JWT/JWT_fun";

const publicPaths = ["/getUserGames", "/getAllUsersName", "/getUserInfo", "/getStatistics", "/getReviews"];

export const authentication = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    console.log(`Authentication middleware called for path: ${req.path}`);

    
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        if (publicPaths.includes(req.path))
            return next();
        return res.status(401).send("не авторизован");
    }

    try {
        const decoded = verifyToken(accessToken, "access");

        if (typeof decoded === "boolean") return res.status(401).send("не авторизован");

        req.JWT = decoded
        next();
    } catch (err) {
        res.status(401).json({ error: "Недействительный токен" });
    }
};
