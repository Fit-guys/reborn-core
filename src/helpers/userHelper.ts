import { User } from "../models/user/user";
import { UsersModel } from '../models/user';

export default class UserHelper {

    public static userStatuses = [
        'Cолдат',
        'Сержант',
        'Лейтенант',
        'Майор',
        'Полковник',
        'Генерал'
    ];
    public static getUserStatus(user: User) {
        const sum = user.totalScore - user.totalTime * 0.1
        if (sum > 5000) {
            return this.userStatuses[5];
        } else if (sum > 4000) {
            return this.userStatuses[4];
        } else if (sum > 3000) {
            return this.userStatuses[3];
        } else if (sum > 2000) {
            return this.userStatuses[2];
        } else if (sum > 1000) {
            return this.userStatuses[1];
        } else {
            return this.userStatuses[0];
        }
    }

    public static getTotalScoreAndTime(user: User) {
        const stories = UsersModel.getUserStories(user);
        let totalScore = 0;
        let totalTime = 0;
        stories.forEach(function (element) {
            totalScore += element.score;
            totalTime += element.time
        })

        return { totalTime, totalScore }
    }
}