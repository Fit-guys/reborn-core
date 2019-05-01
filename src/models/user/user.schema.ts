import { Schema } from 'mongoose';
import { isEmail } from 'validator';
import { hash } from 'bcrypt';

const gameSchema: Schema = new Schema({
    game_id: Schema.Types.Number,
    score: Schema.Types.Number,
    time: Schema.Types.String
}, { usePushEach: true });

const UserSchema: Schema = new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
        unique: [true, "User with this already exist"],
        required: [true, "Name required"]
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
                console.log(hashPassword);
                this.password = hashPassword
                next();
            })
    } else {
        next();
    }
});

export default UserSchema;