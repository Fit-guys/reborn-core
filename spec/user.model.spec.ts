import { UsersModel, User } from '../src/models/user';
import { after } from 'mocha';
import config from "../src/config/config";
var mongoose = require('mongoose');

describe("UserModel Test", function () {
    const connectionString = config.mongodb;
    const testName = "TestName";
    const testEmail = "Test@gmail.com";
    const testPassword = "qwerty";
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
                if (result.email)
                    done();
            })
            .catch((err) => {
                done(new Error(err));
            })
    });

    after(() => {
        UsersModel.remove({ name: testName })
    })

});