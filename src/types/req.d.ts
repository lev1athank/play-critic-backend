import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

// Определяем формат полезной нагрузки JWT
interface JwtPayload {
    id: string;
    login: string;
    data: string
}

// Расширяем интерфейс Request в Express
declare module "express-serve-static-core" {
    interface Request {
        JWT?: JsonToken; // Теперь Request.JWT строго типизирован
    }
}
