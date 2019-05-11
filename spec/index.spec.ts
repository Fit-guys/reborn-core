import { UsersModel, User } from '../src/models/user';
import { after } from 'mocha';
import config from "../src/config/config";
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import UserHelper from '../src/helpers/userHelper';
import { StatHelper } from '../src/helpers/statisticHelper';

chai.use(chaiHttp)

describe('Endpoints test', () => {
  const testName = "TestNameApi"
  const testEmail = "Test@gmail.ia"
  const testPassword = "1234567"
  const story = { game_id: 1, score: 100, time: '11' };
  let token = ""

  it('Register user and return jwt user token', () => {
    return chai.request("localhost:3000")
      .post('/v1/users/register')
      .set('content-type', 'application/json')
      .send({ email: testEmail, name: testName, password: testPassword })
      .then(res => {
        token = res.body.userToken;
        chai.expect(res.body.status).to.eql(true);
        chai.expect(res.body.userToken).is.string;
        chai.expect(res.status).to.eql(200);
        chai.expect(UsersModel.findOne({ name: testName })).is.not.null
      })
  })

  it('Login user by email and password', () => {

    return chai.request("localhost:3000")
      .post('/v1/users/login')
      .set('content-type', 'application/json')
      .send({ email: testEmail, password: testPassword })
      .then(res => {
        chai.expect(res.body.status).to.eql(true);
        chai.expect(res.body.userToken).is.string;
        chai.expect(res.status).to.eql(200);
      })
  })

  it('get user data by jwt token', () => {
    return chai.request("localhost:3000")
      .get(`/v1/users/get`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
        chai.expect(res.body.user.name).to.eql(testName);
        chai.expect(res.body.user.email).to.eql(testEmail);
      })
  })

  it('Forgot user password', () => {

    return chai.request("localhost:3000")
      .post(`/v1/users/forgotPassword`)
      .send({ email: testEmail })
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  it('Change password', () => {
    return chai.request("localhost:3000")
      .put(`/v1/users/changePassword`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: "1" + testPassword })
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  it('Add story', () => {
    return chai.request("localhost:3000")
      .post(`/v1/users/story`)
      .set('Authorization', `Bearer ${token}`)
      .send(story)
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  it('Get user stories', () => {
    return chai.request("localhost:3000")
      .get(`/v1/users/stories`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
        chai.expect(res.body.stories).to.not.null;
      })
  })

  it('Update statistic', () => {
    return chai.request("localhost:3000")
      .post(`/v1/users/stat`)
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  it('Can delete user stories', () => {
    return chai.request("localhost:3000")
      .delete(`/v1/users/stories/clean`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  it('Can send message to support', () => {
    return chai.request("localhost:3000")
      .post(`/v1/users/feedback`)
      .send({ email: testEmail, text: "Test text", name: 'Test name' })
      .then((res) => {
        chai.expect(res.status).to.eql(200);
        chai.expect(res.body.status).to.eql(true);
      })
  })

  after(() => {
    UsersModel.remove({ email: testEmail })
      .then(() => {
        return UsersModel.getUsers();
      })
      .then((users: User[]) => {
        StatHelper.updateStatistic(users);
      })
  })
})
