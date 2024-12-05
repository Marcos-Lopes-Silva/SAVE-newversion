import mongoose, { Document, Model, ObjectId } from "mongoose";

export interface ISurveyUsers {
    surveyId: ObjectId,
    groupId: ObjectId,
}

export interface ISurveyUsersDocument extends ISurveyUsers, Document {
    createdAt: Date,
    updatedAt: Date,
}

const surveySchema: mongoose.Schema = new mongoose.Schema<ISurveyUsersDocument>(
    {
        surveyId: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        groupId: {
            type: mongoose.Types.ObjectId,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const SurveyUsers: Model<ISurveyUsers> = mongoose.models.SurveyUsers || mongoose.model("SurveyUsers", surveySchema);

export default SurveyUsers;