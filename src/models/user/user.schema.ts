import { Schema } from 'mongoose';
import { isEmail } from 'validator';
import UserHelper from "../../helpers/userHelper"
import { hash } from 'bcrypt';
import { userInfo } from 'os';

const gameSchema: Schema = new Schema({
    game_id: Schema.Types.Number,
    score: Schema.Types.Number,
    time: Schema.Types.Number
}, { usePushEach: true });

const UserSchema: Schema = new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
        required: [true, "Name required"]
    },
    role: {
        type: Schema.Types.String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: Schema.Types.String,
        enum: UserHelper.userStatuses,
        default: UserHelper.userStatuses[0]
    },
    email: {
        type: Schema.Types.String,
        trim: true,
        unique: [true, "User with this email already exist"],
        required: [true, "Email required"],
        validate: [isEmail, "invalid email"]
    },
    password: {
        type: Schema.Types.String,
        trim: true,
        required: [true, "Password is required"]
    },
    code: {
        type: Schema.Types.Number,
        trim: true,
    },
    created_date: {
        type: Schema.Types.Date,
        default: Date.now
    },
    google_id: {
        type: Schema.Types.Number,
    },
    story: [gameSchema]
}, { usePushEach: true });

UserSchema.pre('save', function (next) {
    if (this.modifiedPaths().includes('password')) {
        hash(this.password, 12)
            .then((hashPassword) => {
                this.password = hashPassword
                next();
            })
    } else if (this.modifiedPaths().includes('story')) {
        this.status = UserHelper.getUserStatus(this)
        next();
    } else {
        next();
    }
});

export default UserSchema;