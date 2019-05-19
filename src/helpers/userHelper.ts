import { User } from "../models/user/user";
import { UsersModel } from '../models/user';

export default class UserHelper {

    public static userStatuses = [
        'Учень',
        'Студент',
        'Джуніор',
        'Мідл',
        'Сеньйор',
        'Бос'
    ];
    public static getUserStatus(user: User) {
        const sum = user.totalScore 
        if (sum > 370) {
            return this.userStatuses[5];
        } else if (sum > 220) {
            return this.userStatuses[4];
        } else if (sum > 160) {
            return this.userStatuses[3];
        } else if (sum > 100) {
            return this.userStatuses[2];
        } else if (sum > 50) {
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