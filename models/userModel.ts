import mongoose, { Document, Model } from "mongoose";

export interface IUser {
    name: string,
    email: string,
    birthday: string | null,
    role: string,
    approved: boolean,
    image: string,
    cpf: string,
    emailVerified: string | null,
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date,
    updatedAt: Date,
}

const userSchema: mongoose.Schema = new mongoose.Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        birthday: {
            type: String,
        },
        cpf: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            required: true,
            default: "user",
        },
        approved: {
            type: Boolean,
            required: true,
            default: false,
        },
        image: {
            type: String,
            required: false,
        },
        emailVerified: {
            type: String || null,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model("User", userSchema);

export default User;