import { Schema } from 'mongoose';
import { isEmail } from 'validator';

export const UserSchema: Schema = new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
        unique: true,
        required: [true, "Name required"]
    },
    email: {
        type: Schema.Types.String,
        trim: true,
        unique: true,
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
    story: {
        type: Schema.Types.Mixed
    }
});