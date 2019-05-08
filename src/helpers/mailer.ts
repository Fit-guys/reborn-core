import config from '../config/config';
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

export default class MaileHelper {

    public static async sendMail(email: string, text: string, subject: string = "Відновлення пароля") {
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
                user: "cyberunicornreborn@gmail.com",
                clientId: config.googleClientId,
                clientSecret: config.googleClientSecret,
                refreshToken: config.googleRefreshToken,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: "cyberunicornreborn@gmail.com",
            to: email,
            subject: subject,
            generateTextFromHTML: true,
            html: text
        };

        return new Promise(function (resolve, reject) {
            smtpTransport.sendMail(mailOptions, (error, response) => {
                error ? console.log(error) : console.log(response);
                if(error){
                    reject("Error send")
                } else {
                    resolve("Send successful")
                }
                smtpTransport.close();
            })
        });
    }
}



