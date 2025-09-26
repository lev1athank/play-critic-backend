import path from 'path';
import { Request, Response, Router } from "express";
import fs from "fs";
import sharp from 'sharp';
const router = Router();

router.get("/uploads/:filename", async (req: Request, res: Response): Promise<any> => {
    const { filename } = req.params;
    const { w, h, format = "webp", q } = req.query;
    console.log(req.url);
    
    let inputPath: string = ''
    if(filename.split('.').length > 1)
        inputPath = path.join(__dirname, "../../uploads/", filename)
    else
        inputPath = path.join(__dirname, "../../uploads/", `${filename}.webp`);

    console.log("Путь к изображению:", inputPath);

    try {
        // проверяем, что оригинал существует


        const image = sharp(inputPath);
        const metadata = await image.metadata();

        let newWidth = w ? parseInt(w as string) : metadata.width;
        let newHeight = h ? parseInt(h as string) : metadata.height;

        let quality: number;
        if (q) {
            quality = Math.max(0, Math.min(100, parseInt(q as string)));
        } else {
            // вычисляем автоматически
            const origPixels = (metadata.width || 1) * (metadata.height || 1);
            const newPixels = (newWidth || 1) * (newHeight || 1);
            const ratio = newPixels / origPixels;

            quality = Math.round(80 * ratio + 20);
            if (quality < 50) quality = 50;
            if (quality > 100) quality = 100;
        }

        console.log(`Автокачество: ${quality}%\nширина: ${newWidth}, высота: ${newHeight}`);

        let transformer = sharp(inputPath);

        if (w || h) {
            transformer = transformer.resize(newWidth, newHeight);
        }

        transformer = transformer.toFormat('webp', { quality });

        res.type(`image/webp`);
        transformer.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(404).send("Изображение не найдено");
    }
});



export const imgRouter = router;