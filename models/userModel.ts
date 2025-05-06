import mongoose, { Document, Model } from "mongoose";
import { content } from "pdfkit/js/page";

export interface IUser {
    name: string,
    email: string,
    birthday: string | null,
    course: string | null,
    graduationYear: number | null,
    description: string | null,
    role: string,
    approved: boolean,
    image: {
        data: Buffer;
        contentType: string;
    } | null;
    phone: number | null,
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
            unique: true,
        },
        birthday: {
            type: String,
        },
        course: {
            type: String,
            trim: true,
            default: null,
        },
        graduationYear: {
            type: Number,
            default: null,
        },
        description: {
            type: String,
            maxlength: 500,
            trim: true,
            default: null,
        },
        cpf: {
            type: String,
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
            data: {
                type: Buffer, // Buffer para armazenar dados binários
                required: false,
            },
            contentType: {
                type: String,
                required: false,
            },
        },
        phone: {
            type: Number,
        },
        emailVerified: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model("User", userSchema);

export default User;