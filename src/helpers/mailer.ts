import config from '../config/config';
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

export default class MaileHelper {

    public static async sendMail(email: string, text: string) {
        const OAuth2 = google.auth.OAuth2;

        const oauth2Client = new OAuth2(
            config.googleClientId, // ClientID
            config.googleClientSecret, // Client Secret
            config.googleRedirectUrl // Redirect URL
        );

        oauth2Client.setCredentials({
            refresh_token: config.googleRefreshToken
        });

        const header = await oauth2Client.getRequestHeaders();

        const accessToken = header.access_token

        const smtpTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "gromvlad12@gmail.com",
                clientId: "525413493137-c3sitd29skkge5e1io1j90h55neid5lf.apps.googleusercontent.com",
                clientSecret: "bHEub2P5LeK7hDMq60rj2Dca",
                refreshToken: "1/NYFka0lp8t2FcS-2VnrZJjfk-CqUPTQBLk6NN1MAwz4z3jGVFLobPCJhJlQWv0bI",
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: "gromvlad12@gmail.com",
            to: email,
            subject: "Node.js Email with Secure OAuth",
            generateTextFromHTML: true,
            html: text
        };

        smtpTransport.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            smtpTransport.close();
        });
    }
}



