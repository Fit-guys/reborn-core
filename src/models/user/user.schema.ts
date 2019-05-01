import { Schema, SchemaType } from 'mongoose';
import { isEmail } from 'validator';
import { hash } from 'bcrypt';
import { number } from 'prop-types';

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
    },
    created_date: {
        type: Schema.Types.Date,
        default: Date.now
    },
    google_id: {
        type: Schema.Types.Number,
    },
    story: [{
        game_id: Schema.Types.Number,
        score: Schema.Types.Number,
        time: Schema.Types.String
    }]
});

UserSchema.pre('save', function (next) {
    hash(this.password, 12)
        .then((hashPassword) => {
            console.log(hashPassword);
            this.password = hashPassword
            next();
        })

});

export default UserSchema;