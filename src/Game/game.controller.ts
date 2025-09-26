import { Request, Response, Router } from "express";
import { GameService } from "./game.service";


const router = Router();
const gameService = new GameService();

router.get("/getGame", async (req: Request, res: Response): Promise<any> => {
    console.log(req.query.name);
    if (req.query?.name) {
        const games = await gameService.getGame(req.query.name as string)

        return res.status(200).json({ game: games });
    }
    return res.status(400).json({ error: "Имя игры не указано" });
});

router.get("/getUserGames", async (req: Request, res: Response): Promise<any> => {
    const userId = await gameService.getUserIDForName(req.query.userName as string);

    if (!userId) {
        return res.status(400).json({ error: "Пользователь не найден" });
    }

    const games = await gameService.getUserGames(userId)

    return res.status(200).json({ games: games });
});

router.get("/getStatistics", async (req: Request, res: Response): Promise<any> => {
    if (!req.query.appid) {
        return res.status(400).json({ error: "appid is required" });
    }

    const games = await gameService.getStatistics(+req.query.appid);

    return res.status(200).json({ data: games });
});


router.get("/getReviews", async (req: Request, res: Response): Promise<any> => {
    if (!req.query.appid) {
        return res.status(400).json({ error: "appid is required" });
    }

    const review = await gameService.getReview(+req.query.appid, req.query?.start ? +req.query.start : 0, req.query?.newSort === 'false' ? false : true);
    console.log(review, 123);

    return res.status(200).json(review);
});

router.post("/addGame", async (req: Request, res: Response): Promise<any> => {
    const data = await gameService.addGame(req.JWT.id, req.body)
    if (!data) {
        return res.status(400).json({ error: "Игра уже добавлена" });
    }
    else {
        return res.status(200).json(data);
    }
});
router.post("/editGame", async (req: Request, res: Response): Promise<any> => {
    const data = await gameService.editGame(req.JWT.id, req.body)
    if (!data) {
        return res.status(400).json({ error: "Ошибка редактирования" });
    }
    else {
        return res.status(200).json(data);
    }
});

router.delete("/deleteGame", async (req: Request, res: Response): Promise<any> => {

    if (typeof req.query.appid === "undefined") {
        return res.status(400).json({ error: "appid is required" });
    }

    const data = await gameService.deleteGame(req.JWT.id, +req.query.appid);

    if (!data) {
        return res.status(400).json({ error: "Игра не найдена" });
    }
    else {
        return res.status(200).json(data);
    }
});

export const gameRouter = router;
