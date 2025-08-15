import { DBGamesSchema } from "../DB/DbSchema/game";
import { gameFinds } from "../DB/DbSchema/gameFind";
import { DBUserSchema } from "../DB/DbSchema/user";
import { TgameFind } from "./game.type";
import axios from 'axios';
import { Types } from "mongoose";
interface SteamAppDetails {
	type?: string;
	[key: string]: any;
}


interface Igame {
	appid: number;
	name: string
	story: number;
	gameplay: number;
	originality: number;
	immersion: number;
	description: string;
	status: number;
}

// Проверка: является ли appid игрой
async function isSteamGame(appid: number): Promise<boolean> {
	try {

		const res = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appid}`);

		const appData = res.data[appid];
		return appData.success && appData.data?.type === 'game';
	} catch (error) {
		console.error(`Ошибка при проверке appid ${appid}:`, error);
		return false;
	}
}


export class GameService {
	public async getGame(name: string) {
		const games: TgameFind[] = await gameFinds.aggregate([
			{ $match: { name: { $regex: `^${name}`, $options: 'i' } } },
			{ $limit: 5 }
		]);
		return games;
	}

	public async getUserGames(id: string) {
		const games = await DBGamesSchema.find({ userId: new Types.ObjectId(id) });
		return games;

	}

	public async getUserIDForName(userName: string) {
		const user = await DBUserSchema.findOne({
			login: userName
		})
		return user ? user._id.toString() : null;
	}



	public async addGame(id: string, game: Igame) {
		const objectId = new Types.ObjectId(id);

		const existingGame = await DBGamesSchema.findOne({
			userId: objectId,
			appid: game.appid
		});

		if (existingGame) {
			return false
		}

		const newGame = await DBGamesSchema.create({
			userId: objectId,
			...game
		});

		return newGame;
	}
	public async editGame(id: string, game: Igame) {
		const objectId = new Types.ObjectId(id);

		const existingGame = await DBGamesSchema.findOne({
			userId: objectId,
			appid: game.appid
		});

		if (!existingGame) {
			return false;
		}
		console.log(game);

		await DBGamesSchema.updateOne(
			{
				userId: objectId,
				appid: game.appid,
			},
			{
				$set: {
					name: game.name,
					story: game.story,
					gameplay: game.gameplay,
					originality: game.originality,
					immersion: game.immersion,
					description: game.description,
					status: game.status
				}
			},
			{ upsert: false }
		);

		const updatedGame = await DBGamesSchema.findOne({
			userId: objectId,
			appid: game.appid
		});

		return updatedGame;
	}

	public async deleteGame(id: string, appid: number) {
		const objectId = new Types.ObjectId(id);

		const existingGame = await DBGamesSchema.findOne({
			userId: objectId,
			appid: appid
		});

		if (!existingGame) {
			return false;
		}

		await DBGamesSchema.deleteOne({
			userId: objectId,
			appid: appid
		});

		return true;
	}


	public async getStatistics(appid: number) {
		const gameStats = await DBGamesSchema.aggregate([
			{ $match: { appid: appid } },
			{
				$group: {
					_id: "$appid",
					averageStory: { $avg: "$story" },
					averageGameplay: { $avg: "$gameplay" },
					averageOriginality: { $avg: "$originality" },
					averageImmersion: { $avg: "$immersion" },
					count: { $sum: 1 },
					reviewCount: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $ne: ["$description", null] },
										{ $ne: ["$description", ""] },
										{ $ifNull: ["$description", false] }
									]
								},
								1,
								0
							]
						}
					}
				}
			}
		]);


		return gameStats.length > 0 ? gameStats[0] : null;
	}

	public async getReview(appid: number, skip = 0, newSort = true) {
		const reviews = await DBGamesSchema.find({
			appid,
			description: { $exists: true, $ne: "" }
		})
			.skip(skip)
			.limit(10)
			.sort({ _id: newSort ? -1 : 1 });

		// Берём userId из отзывов
		const userIds = reviews.map(review => review.userId);	

		// Оставляем _id, чтобы потом маппить, и добавляем login
		const users = await DBUserSchema.find(
			{ _id: { $in: userIds } },
			{ login: 1 } // _id оставляем по умолчанию
		);

		return reviews.map(review => ({
			...review.toObject(),
			userName: users.find(user => String(user._id) === String(review.userId))?.login || null
		}));
	}


}