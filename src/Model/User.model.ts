import mongoose, {Schema, Document} from 'mongoose';

export interface Message extends Document{ // define blueprint for data
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

export interface User extends Document{ // define blueprint for data
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}


const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true,"Username is required"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true,"Username is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Plesse use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is Required'],
    },
    verifyCode: {
        type: String,
        required: [true, 'verify code is Required'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, 'verify codeexpiry is Required'],
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",UserSchema) 

export default UserModel;