import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userData } from "../Authorization/auth.type";
dotenv.config();

const JWTsecretAccesskey = process.env.JWTsecretAccessKey || "";
const JWTsecretRefreshKey = process.env.JWTsecretRefreshKey || "";

export const createToken = (
    id: string,
    login: string,
    key: "access" | "refresh"
): string => {
    return jwt.sign(
        {
            id: id,
            login: login,
            date: Math.floor(Date.now() / 1000),
        },
        key == "access" ? JWTsecretAccesskey : JWTsecretRefreshKey,
        { expiresIn: key == "access" ? "15m" : "15d" }
    );
};

export const verifyToken = (
    token: string,
    key: "access" | "refresh"
): { id: string; login: string; date: string } | boolean => {
    try {
        const payload = <jwt.JwtPayload>(
            jwt.verify(
                token,
                key === "access" ? JWTsecretAccesskey : JWTsecretRefreshKey,
                { complete: false }
            )
        );

        return {
            id: payload.id,
            login: payload.login,
            date: payload.date,
        };
    } catch (err) {
        console.log(err);
        return false; // Возвращаем false в случае ошибки
    }
};
