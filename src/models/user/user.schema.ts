import { Schema } from 'mongoose';
import { isEmail } from 'validator';
import UserHelper from "../../helpers/userHelper"
import { hash } from 'bcrypt';

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
        default: UserHelper.userStatuses[0]
    },
    rate: {
        type: Schema.Types.Number,
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
    story: [gameSchema],
    totalScore: {
        type: Schema.Types.Number,
    },
    totalTime: {
        type: Schema.Types.Number,
    }
}, { usePushEach: true });

UserSchema.pre('save', function (next) {

    if (this.modifiedPaths().includes('password')) {
        hash(this.password, 12)
            .then((hashPassword) => {
                this.password = hashPassword
                next();
            })
    } else if (this.modifiedPaths().includes('story')) {
        const { totalTime, totalScore } = UserHelper.getTotalScoreAndTime(this);
        this.totalTime = totalTime;
        this.totalScore = totalScore;
        this.status = UserHelper.getUserStatus(this);
        next();
    } else {
        if (!UserHelper.userStatuses.includes(this.status)) {
            this.status = UserHelper.getUserStatus(this);
        }
        next();
    }
});

export default UserSchema;