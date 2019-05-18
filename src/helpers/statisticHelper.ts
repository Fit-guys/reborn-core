import { User } from '../models/user/user';
const excel = require('excel4node');
import GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../../credentials/client_spreadsheets_secret.json');
const { promisify } = require('util')

export class StatHelper {
    public static updateStat(users: User[]) {

        let workbook = new excel.Workbook();

        let roleStat = workbook.addWorksheet('All users');
        let gameScoreStat = workbook.addWorksheet('Game Score');

        roleStat.cell(1, 1).string('User name');
        roleStat.cell(1, 2).string('Role');
        roleStat.cell(1, 3).string('Status');

        gameScoreStat.cell(1, 1).string('User name');
        gameScoreStat.cell(1, 2).string('Game id');
        gameScoreStat.cell(1, 3).string('Score');
        gameScoreStat.cell(1, 4).string('Time');

        let i = 2;
        let j = 2;
        users.forEach((user: User) => {
            roleStat.cell(i, 1).string(user.name);
            roleStat.cell(i, 2).string(user.role);
            roleStat.cell(i++, 3).string(user.status);

            user.story.forEach((story) => {
                gameScoreStat.cell(j, 1).string(user.name);
                gameScoreStat.cell(j, 2).string(story.game_id.toString());
                gameScoreStat.cell(j, 3).string(story.score.toString());
                gameScoreStat.cell(j++, 4).string(story.time);
            })
        })
        workbook.write('reports/report.xlsx');
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