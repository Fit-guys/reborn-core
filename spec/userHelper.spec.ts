import { UsersModel } from "../src/models/user";
import UserHelper from "../src/helpers/userHelper";
import config from "../src/config/config";

var mongoose = require('mongoose');

describe("UserHelper test", function () {
    let globalUser;
    before((done) => {
        mongoose.Promise = global.Promise;
        mongoose.connect(config.mongodb, {
            useMongoClient: true
        });
        done();
    })

    it('Can calculate user total score', (done) => {
        UsersModel.create('Test', 'email@dd.cc', "23123")
            .then(data => {
                return UsersModel.findOneByJwtToken(data.userToken)
            })
            .then(userData => {
                return UsersModel.addUserStory(userData.user, { game_id: 1, score: 83, time: 97 })
            })
            .then(user => {
                globalUser = user;
                const { totalScore, totalTime } = UserHelper.getTotalScoreAndTime(user)
                if (totalScore == 83 && totalTime == 97) {
                    done();
                } else {
                    done(new Error());
                }
            })
            .catch(err => {
                done(err)
            })

    });

    it('Can calculate user status', (done) => {
        UsersModel.addUserStory(globalUser, { game_id: 1, score: 10000, time: 97 })
            .then((user) => {
                if (UserHelper.getUserStatus(user) == 'Бос') {
                    done();
                } else {
                    done(new Error());
                }
            })
            .catch(err => {
                done(err)
            })

    });

    after((done) => {
        UsersModel.remove({ email: 'email@dd.cc' });
        done();
    })
});