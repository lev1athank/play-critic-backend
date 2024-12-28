import { Request, Response, Router } from "express";
import { AuthService } from "./authorization.service";
import { createUserDto } from "./auth.dto";
import { verifyToken } from "../JWT/JWT_fun";
import { DBUserSchema } from "../DB/DbSchema/user";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    const validation = createUserDto.safeParse(req.body);
    if (!validation.success)
        return res.status(422).json(validation.error.errors[0]);

    const tokens = await authService.login(req.body)
    if(!tokens) return res.status(401).send("неверный логин или пароль")
    res.status(200).json(tokens)

});

router.post("/singup", async (req: Request, res: Response): Promise<any> => {
    const validation = createUserDto.safeParse(req.body);
    if (req.body.password == req.body.login)
        return res.status(422).send("pass = login");
    if (!validation.success)
        return res.status(422).json(validation.error.errors[0]);

    const isLogin = await DBUserSchema.findOne({
        login: req.body.login
    })
    if(isLogin) return res.status(422).send("логин занят");

    const tokens = await authService.singup(req.body);
    if(!tokens) return res.status(401).send('неверный токен');
    return res.status(200).json(tokens);
});

router.post("/verify", (req: Request, res: Response): any => {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const decoded = verifyToken(token, "access");
    if (!decoded) return res.status(401).send("не авторизован");
    return res.status(200).json(decoded);
});

router.post("/refresh-token", async (req: Request, res: Response): Promise<any> => {
    const refToken: string = req.body["refresh-token"];
    
    if (!refToken) return res.status(202).send("отсутствует refresh-token");
    const tokens = await authService.getRefrashToken(refToken)
    if(!tokens) return res.status(422).send('не верный refresh-token')
    res.status(200).json(tokens)
});

export const authRouter = router;
