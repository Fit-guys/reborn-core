import { User } from '../models/user/user';
import excel = require('excel4node');
import GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../../credentials/client_spreadsheets_secret.json');
const { promisify } = require('util')

export class StatHelper {
    public static updateStat(users: User[]) {

        let workbook = new excel.Workbook();

        this.generateUserRoleReport(workbook, users);
        this.generateUserGameScore(workbook, users);
        this.generateUserGameTime(workbook, users);
        this.generateUserTotalStat(workbook, users);

        workbook.write('reports/report.xlsx');
    }

    public static generateUserRoleReport(workbook: excel.Workbook, users: User[]) {
        let roleStat = workbook.addWorksheet('Звіт 1');
        roleStat.cell(1, 1).string('Ім\'я користувача');
        roleStat.cell(1, 2).string('Статус користувача');
        let i = 2;
        users.forEach((user: User) => {
            roleStat.cell(i, 1).string(user.name);
            roleStat.cell(i++, 2).string(user.status);
        });
    }

    public static generateUserGameScore(workbook: excel.Workbook, users: User[]) {
        let roleStat = workbook.addWorksheet('Звіт 2');
        roleStat.cell(1, 1).string('Ім\'я користувача');
        roleStat.cell(1, 2).string('Номер гри');
        roleStat.cell(1, 3).string('Кількість балів');
        let i = 2;
        users.forEach((user: User) => {
            if (user.story && user.story.length > 0) {
                roleStat.cell(i++, 1).string(user.name);
                user.story.forEach((story) => {
                    roleStat.cell(i, 2).number(story.game_id + 1);
                    roleStat.cell(i++, 3).number(story.score);
                });
            }
        });
    }

    public static generateUserGameTime(workbook: excel.Workbook, users: User[]) {
        let stat = workbook.addWorksheet('Звіт 3');
        stat.cell(1, 1).string('Ім\'я користувача');
        stat.cell(1, 2).string('Номер гри');
        stat.cell(1, 3).string('Кількість секунд у грі');
        let i = 2;
        users.forEach((user: User) => {
            if (user.story && user.story.length > 0) {
                stat.cell(i++, 1).string(user.name);
                user.story.forEach((story) => {
                    stat.cell(i, 2).number(story.game_id + 1);
                    stat.cell(i++, 3).number(story.time);
                });
            }
        });
    }
    public static generateUserTotalStat(workbook: excel.Workbook, users: User[]) {
        let stat = workbook.addWorksheet('Звіт 4');
        stat.cell(1, 1).string('Ім\'я користувача');
        stat.cell(1, 2).string('Загальна кількість балів');
        stat.cell(1, 3).string('Загальна кількість часу');
        let i = 2;
        users.forEach((user: User) => {
            if (user.totalScore && user.totalTime) {
                stat.cell(i, 1).string(user.name);
                stat.cell(i, 2).number(user.totalScore);
                stat.cell(i++, 3).number(user.totalTime);
            }
        });
    }

    public static async updateStatistic(users: User[]) {

        let doc = new GoogleSpreadsheet('1JSNYuhyKTszOU2e3s8hy_pla1JjdznA1vJFv7153Zfg');
        await promisify(doc.useServiceAccountAuth)(creds);
        await this.deleteOldStat(doc);
        this.addTotalStat(users, doc);
        this.addScoreStat(users, doc);
        this.addUserStat(users, doc);
    }


    private static async addTotalStat(users: User[], doc) {
        for (let i = 0; i < users.length; i++) {
            doc.addRow(4, {
                'User_name': users[i].name,
                'Total_score': users[i].totalScore,
                'Total_time': users[i].totalTime
            }, () => { });
        }
    }

    private static async addScoreStat(users: User[], doc) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].story && users[i].story.length > 0) {
                await promisify(doc.addRow)(3, {
                    'User_name': users[i].name,
                    'Game_id': users[i].story[0].game_id,
                    'Time': users[i].story[0].time
                });

                await promisify(doc.addRow)(2, {
                    'User_name': users[i].name,
                    'Game_id': users[i].story[0].game_id,
                    'Score': users[i].story[0].score
                });

                for (let j = 1; j < users[i].story.length; j++) {

                    await promisify(doc.addRow)(2, {
                        'User_name': '',
                        'Game_id': users[i].story[j].game_id,
                        'Score': users[i].story[j].score
                    });

                    await promisify(doc.addRow)(3, {
                        'User_name': '',
                        'Game_id': users[i].story[j].game_id,
                        'Time': users[i].story[j].time
                    });
                }
            }

        }
    }

    private static async addUserStat(users: User[], doc) {
        for (let i = 0; i < users.length; i++) {
            doc.addRow(1, {
                'User_name': users[i].name,
                'Role': users[i].role,
                'Status': users[i].status
            }, () => { });
        }
    }

    private static async deleteOldStat(doc) {
        for (let i = 1; i <= 4; i++) {
            let rows = await promisify(doc.getRows)(i);
            for (let i = rows.length - 1; i >= 0; i--) {
                await promisify(rows[i].del)();
            }
        }
    }
}