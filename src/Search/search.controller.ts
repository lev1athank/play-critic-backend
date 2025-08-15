import { Request, Response, Router } from "express";
import { SearchService } from "./search.service";
import { UpdateUserProfileRequest } from "./search.type";


const router = Router();
const gameService = new SearchService();

router.get("/getAllUsersName", async (req: Request, res: Response): Promise<any> => {

    const usersName = await gameService.getAllUsersName(req.query?.userName as string)

    return res.status(200).json({ usersName: usersName });
});

router.get("/getUserInfo", async (req: Request, res: Response): Promise<any> => {
    const userInfo = await gameService.getUserInfo(req.query?.userName as string, req.query?.userId as string)
    if (!userInfo) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ userInfo: userInfo });
})

router.post("/updateUserProfile", async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, descriptionProfile, loveGame, isCloseProfile, avatar }: UpdateUserProfileRequest = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const updateData: Partial<UpdateUserProfileRequest> = {};
        if (descriptionProfile !== undefined) updateData.descriptionProfile = descriptionProfile;
        if (loveGame !== undefined) updateData.loveGame = loveGame;
        if (isCloseProfile !== undefined) updateData.isCloseProfile = isCloseProfile;
        if (avatar !== undefined) updateData.avatar = avatar;

        const updatedProfile = await gameService.updateUserProfile(userId, updateData);
        
        return res.status(200).json({ 
            message: "Profile updated successfully", 
            userInfo: updatedProfile 
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export const searchRouter = router;