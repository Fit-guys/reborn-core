import { UsersModel } from '../src/models/user';
import { after } from 'mocha';
import config from "../src/config/config";
import { compare } from 'bcrypt';

var mongoose = require('mongoose');

describe("UserModel Test", function () {
    const connectionString = config.mongodb;
    const testName = "TestName";
    const testEmail = "Test@gmail.com";
    const testPassword = "qwerty";
    const story = { game_id: 1, score: 100, time: 11 };
    let token = "";


    before((done) => {
        mongoose.Promise = global.Promise;
        mongoose.connect(connectionString, {
            useMongoClient: true
        });

        UsersModel.remove({ name: testName, email: testEmail })
            .then(() => {
                done()
            })
    });

    it('Can save a new valid model', (done) => {
        UsersModel.create(testName, testEmail, testPassword)
            .then((result) => {
                if (result.userToken) {
                    token = result.userToken;
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can find model by condition', (done) => {
        UsersModel.findOne({ name: testName })
            .then((result) => {
                if (result.email)
                    done();
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can update model ', (done) => {
        UsersModel.update({ name: testName }, { email: "test" + testEmail })
            .then((result) => {
                if (result.email == "test" + testEmail)
                    done();
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can get model by jwt token', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                if (result.user.email)
                    done();
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can add story to user', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                let user = result.user;
                return UsersModel.addUserStory(user, story)

            })
            .then((user) => {
                if (user.story.findIndex((element) => {
                    return element.game_id == story.game_id;
                }) >= 0) {
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can generate user code', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                return UsersModel.generateUserCode(result.user)

            })
            .then((user) => {
                if (user.code) {
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can update user password ', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                return result.user
            })
            .then((user) => {
                return UsersModel.updateUserPassword(user, "new password");
            })
            .then((user) => {
                return compare("new password", user.password);
            })
            .then((compare) => {
                if (compare) {
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can get user story', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                return UsersModel.getUserStories(result.user)
            })
            .then((stories) => {
                if (stories.findIndex((element) => {
                    return element.game_id == story.game_id;
                }) >= 0) {
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can delete user stories', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                UsersModel.delteUserStories(result.user)
                done();
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can get users', (done) => {
        UsersModel.getUsers()
            .then((users) => {
                if ((users.find((element) => {
                    return element.name == testName
                }))) {
                    done();
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    it('Can rate game', (done) => {
        UsersModel.findOneByJwtToken(token)
            .then((result) => {
                return UsersModel.rateGame(result.user, '10')
            }).then((user) => {
                if (user.rate == '10') {
                    done()
                }
            })
            .catch((err) => {
                done(new Error(err));
            })
    });


    after(() => {
        UsersModel.remove({ name: testName })
    })

});