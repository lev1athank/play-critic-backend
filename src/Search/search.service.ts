import { DBUser, DBUserProfile } from "../DB/DbSchema/user";
import { ObjectId } from "mongodb"
import { UpdateUserProfileRequest } from "./search.type";


export class SearchService {
    public async getAllUsersName(userName: string = "") {

        const users = await DBUser.find({
            login: { $regex: userName.trim(), $options: 'i' }
        })
            .limit(5)
            .select('login -_id')

        return users.map(user => user.login);
    }

    public async getUserInfo(Qlogin: string = "", userId: string = "") {
        const conditions: any[] = [];

        if (userId) {
            conditions.push({ _id: userId });
        }

        if (Qlogin) {
            conditions.push({ login: Qlogin });
        }

        const user = await DBUser.findOne(
            conditions.length > 0 ? { $or: conditions } : {}
        )
            .populate("profileId")
            .populate("userGamesId")

        // Если пользователя не нашли
        if (!user) {
            return null;
        }

        return user.toObject();
    }


    public async updateUserProfile(userId: string, updateData: Partial<UpdateUserProfileRequest>) {

        try {
            if (updateData.avatar)
                delete updateData.avatar;

            const id = new ObjectId(userId);
            const result = await DBUserProfile.findOneAndUpdate(
                { userId: id },
                { $set: updateData },
                { new: true, upsert: true }
            );

            if (updateData.userName)
                await DBUser.findByIdAndUpdate(id, { userName: updateData.userName });

            return result;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
    public async uploadUserAvatar(userId: string, avatarFileName: string) {
        try {
            console.log("AVATAR", avatarFileName);

            const id = new ObjectId(userId);
            const result = await DBUser.findOneAndUpdate(
                { _id: id },
                { $set: { avatar: avatarFileName } },
                { new: true, upsert: true }
            );

            return result;
        } catch (error) {
            console.error('Error uploading user avatar:', error);
            throw error;
        }
    }

}

