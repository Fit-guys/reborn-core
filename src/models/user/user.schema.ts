import { Schema } from 'mongoose';

export const UserSchema: Schema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
    }
});