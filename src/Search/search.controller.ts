import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response, Router } from "express";
import { SearchService } from "./search.service";
import { UpdateUserProfileRequest } from "./search.type";
import multer from "multer";
import { DBUserProfile } from "../DB/DbSchema/user";
import sharp from 'sharp';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();
const gameService = new SearchService();

router.get("/getAllUsersName", async (req: Request, res: Response): Promise<any> => {

    const usersName = await gameService.getAllUsersName(req.query?.userName as string)

    return res.status(200).json({ usersName: usersName });
});

router.get("/getUserInfo", async (req: Request, res: Response): Promise<any> => {
    console.log(req.query);
    
    const userInfo = await gameService.getUserInfo(req.query?.userName as string, req.query?.userId as string)
    if (!userInfo) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(userInfo);
})

router.post("/updateUserProfile", async (req: Request, res: Response): Promise<any> => {
    try {
        const data: UpdateUserProfileRequest = req.body;

        if (!data.userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const updatedProfile = await gameService.updateUserProfile(data.userId, data);

        return res.status(200).json({
            message: "Profile updated successfully",
            userInfo: updatedProfile
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/uploadUserAvatar", upload.single("avatar"), async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "Avatar file is required" });
        }

        const user = await DBUserProfile.findOne({ userId });
        console.log(req.file);

        const outputPath = path.join(__dirname, "../../uploads/", `avatar_${userId}.webp`);
        console.log(`Saving avatar to: ${outputPath}`);
        
        const img = await sharp(req.file.buffer)
            .toFormat("webp")
            .webp({ quality: 100 })
            .toFile(outputPath);
        console.log(img);



        const updatedProfile = await gameService.uploadUserAvatar(req.body.userId, `avatar_${userId}.webp`);
        return res.status(200).json({
            message: "Avatar updated successfully",
            userInfo: updatedProfile
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



export const searchRouter = router;