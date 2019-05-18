import { Express, Request, Response } from "express";
import { usersController } from "../controllers/user.controller";
import { NextFunction } from "connect";

export default class UsersRoute {
	private static private = ['/v1/users/get', '/v1/users/story', '/v1/users/stories', '/v1/users/stories/clean', '/v1/users/rate'];
	public static protected = ['/v1/users/changePassword'];

	constructor(app: Express) {

		app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
			console.error(err.stack);
			res.status(500).send('Something broke!');
		});

		app.use(async function (req: Request, res: Response, next: NextFunction) {

			let data = { user: null, type: null };
			if (req.headers.authorization) {
				data = await usersController.getUserByAuthHeader(req.headers.authorization);
			}
			
			if (UsersRoute.private.includes(req.path)) {
				usersController.user = data.type == 'full' ? data.user : null;
			} else if (UsersRoute.protected.includes(req.path)) {
				usersController.user = data.user;
			}

			next();
		});

		app.route("/v1/users/login").post(
			usersController.loginWithEmail
		);

		app.route("/v1/users/register").post(
			usersController.registerWithEmail
		);

		app.route("/v1/users/get").get(
			usersController.getUserData
		);

		app.route("/v1/users/forgotPassword").post(
			usersController.forgotPassword
		);

		app.route("/v1/users/changePassword").put(
			usersController.changePassword
		);

		app.route("/v1/users/story").post(
			usersController.addUserStory
		);

		app.route("/v1/users/stories").get(
			usersController.getUserStories
		);

		app.route("/v1/users/checkCode").post(
			usersController.checkUserCode
		);

		app.route("/v1/users/stat").post(
			usersController.updateStat
		)

		app.route("/v1/users/stories/clean").delete(
			usersController.removeUserStories
		)

		app.route("/v1/users/feedback").post(
			usersController.sendSupportEmail
		)

		app.route("/v1/users/rate").post(
			usersController.rateGame
		)

	}
}