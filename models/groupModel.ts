import mongoose, { Document, isObjectIdOrHexString, Model, ObjectId } from "mongoose";

export interface IGroup {
    name: string,
    firstLetter: string,
    description: string,
    members: IUsers[],
    author: ObjectId,
}

export interface IUsers {
    id: string,
    name: string,
    email: string,
    cpf?: string,
    birthDate?: string,
    rg?: string,
}

export interface IGroupDocument extends IGroup, Document {
    createdAt: Date,
    updatedAt: Date,
}

const usersSchema: mongoose.Schema = new mongoose.Schema<IUsers>({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cpf: {
        type: String,
        required: false,
    },
    birthDate: {
        type: String,
        required: false,
    },
    rg: {
        type: String,
        required: false,
    }
}, {
    timestamps: false,
})

const groupSchema: mongoose.Schema = new mongoose.Schema<IGroupDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        firstLetter: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        members: {
            type: [usersSchema],
            required: true,
        },
        author: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: false,
    }
);

const Group: Model<IGroupDocument> = mongoose.models.Group || mongoose.model("Group", groupSchema);

export default Group;
