import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWTsecretAccesskey = process.env.JWTsecretAccessKey || "";
const JWTsecretRefreshKey = process.env.JWTsecretRefreshKey || "";

export const createToken = (id:string, login:string, key: 'access' | 'refresh'): string => {
    return jwt.sign({
        'id': id,
        'login': login,
        'date': Math.floor(Date.now() / 1000)
    }, key == "access" ? JWTsecretAccesskey : JWTsecretRefreshKey, { expiresIn: key == "access" ? '15m' : '15d' });
};

export const verifyToken = (
    token: string,
    key: "access" | "refresh"
): jwt.JwtPayload | boolean => {
    try {
        const a = <jwt.JwtPayload>(
            jwt.verify(
                token,
                key == "access" ? JWTsecretAccesskey : JWTsecretRefreshKey,
                { complete: false }
            )
        );
        return a;
    } catch (err) {
        console.log(err);
        
        return false;
    }
};


