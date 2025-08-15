import { DBUserSchema } from "../DB/DbSchema/user";
import { UsersDataSchema } from "../DB/DbSchema/usersData";
import { ObjectId } from "mongodb"


export class SearchService {
    public async getAllUsersName(userName: string = "") {

        const users = await DBUserSchema.find({
            login: { $regex: userName.trim(), $options: 'i' }
        })
            .limit(5)
            .select('login -_id')

        return users.map(user => user.login);
    }

    public async getUserInfo(userName: string = "", userId: string = "") {
        let usersID: string | undefined;

        if (userId) {
            usersID = userId;
        } else if (userName) {
            const user = await DBUserSchema.findOne({ login: userName });
            usersID = user?._id?.toString();
        }

        // Если пользователя не нашли
        if (!usersID) {
            return null;
        }

        // Ищем или создаём запись в UsersDataSchema
        let usersInfo = await UsersDataSchema.findOne({ userId: usersID });
        if (!usersInfo) {
            usersInfo = await UsersDataSchema.create({ userId: usersID });
        }

        return usersInfo;
    }


    public async updateUserProfile(userId: string, updateData: {
        descriptionProfile?: string;
        loveGame?: string;
        isCloseProfile?: boolean;
        avatar?: string;
    }) {

        try {
            const id = new ObjectId(userId);
            const result = await UsersDataSchema.findOneAndUpdate(
                { userId: id },
                { $set: updateData },
                { new: true, upsert: true }
            );

            return result;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

}

