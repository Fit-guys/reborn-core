import { User } from "models/user";
var excel = require('excel4node');

export class StatHelper {
    public static updateStat(users: User[]) {

        var workbook = new excel.Workbook();

        var roleStat = workbook.addWorksheet('All users');
        var gameScoreStat = workbook.addWorksheet('Game Score');

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
}