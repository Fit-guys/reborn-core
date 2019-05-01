import { sync } from 'glob';
import { union } from 'lodash';

export default class Config {
	public static port: number = 3000;
	public static routes: string = './dist/routes/**/*.js';
	public static models: string = './dist/models/**/*.js';
	public static useMongo: boolean = true;
	public static googleClientId: string = '525413493137-c3sitd29skkge5e1io1j90h55neid5lf.apps.googleusercontent.com';
	public static googleClientSecret: string = 'bHEub2P5LeK7hDMq60rj2Dca';
	public static googleRedirectUrl: string = 'https://developers.google.com/oauthplayground';
	public static googleRefreshToken: string = '1/NYFka0lp8t2FcS-2VnrZJjfk-CqUPTQBLk6NN1MAwz4z3jGVFLobPCJhJlQWv0bI';
	public static mongodb = process.env.NODE_ENV === 'docker' ? 
	'mongodb://mongo:27017/reborn-core' : 
	'mongodb://localhost:27017/reborn-core';
	public static globFiles(location: string): string[] {
		return union([], sync(location));
	}
}