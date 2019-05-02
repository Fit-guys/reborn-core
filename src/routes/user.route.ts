import { Express, Request, Response } from "express";
import { usersController } from "../controllers/user.controller";
import { NextFunction } from "connect";

export default class UsersRoute {
	constructor(app: Express) {

		app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
			console.error(err.stack);
			res.status(500).send('Something broke!');
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

		
	
	}
}