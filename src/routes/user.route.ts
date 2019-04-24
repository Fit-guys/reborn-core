import { Express } from "express";
import { usersController } from "../controllers/user.controller";

export default class UsersRoute {
	constructor(app: Express) {

		app.route("/v1/users/login").post(
			usersController.loginWithEmail
		);

		app.route("/v1/users/register").post(
			usersController.registerWithEmail
		)
		app.route("/v1/users/get").get(
			usersController.getUserData
		)
	}
}