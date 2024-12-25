import { connectDB } from "../DB/DB";
import { DBUserSchema } from "../DB/DbSchema/user";

export class AuthService {
    private dataBase = connectDB;

    public async createUser(data: userData):Promise<Boolean> {
		this.dataBase()
		try {
			const newUser = new DBUserSchema({
				login: data.login,
				password: data.password
			})
	
			await newUser.save()
			return true
		} catch (err) {
			console.log(err);
			return false

		}
	}
}
