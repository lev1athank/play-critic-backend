import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../JWT/JWT_fun";

export const authentication = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    const accessToken = req.headers.authorization;
    if (!accessToken)
        return res.status(401).send("не авторизован");

    try {
        const token = accessToken?.split(" ")[1] || "";
        const decoded = verifyToken(token, "access");
        if(!decoded) return res.status(401).send("не авторизован");
        // req = decoded
        next();
    } catch (err) {
            res.status(401).json({ error: "Недействительный токен" });
    }
}; 
 