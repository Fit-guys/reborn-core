import { sync } from 'glob';
import { union } from 'lodash';

export default class Config {
	public static port: number = 3000;
	public static routes: string = './dist/routes/**/*.js';
	public static models: string = './dist/models/**/*.js';
	public static useMongo: boolean = true;
	public static jwtTokenExpiresIn = 60 * 60 * 24 * 7 * 4; // one month.
	public static jwtTokenSecret = ""
	public static googleClientId: string = '525413493137-itvk51ujikh79sfoti51g0rq90mph5kr.apps.googleusercontent.com';
	public static googleClientSecret: string = 'ptAawlHdRkMT01SRZTXJ-V_R';
	public static googleRedirectUrl: string = 'https://developers.google.com/oauthplayground';
	public static googleRefreshToken: string = '1/mHZyeq_Su4Iv9-o5ibLcHof4glK00Os0elM9pDjgFeMrFXxpdEiHW04Dn9owlaON';
	public static mongodb = process.env.NODE_ENV === 'docker' ?
		'mongodb://mongo:27017/reborn-core' :
		'mongodb://localhost:27017/reborn-core';
	public static globFiles(location: string): string[] {
		return union([], sync(location));
	}
}