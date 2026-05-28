import mongoose, { Document, Model } from "mongoose";

export interface IOption {
    value: string;
    label: string;
}

export interface IRow {
    id: number;
    text: string;
}

export interface IQuestion {
    id: number,
    title: string,
    name: string,
    type: "text" | "radio" | "checkbox" | "date" | "number" | "select" | "textarea" | "dropdown" | "rating" | 'table',
    options?: Array<IOption>,
    rows?: Array<IRow>,
    required: boolean,
    placeholder?: string,
    other?: boolean,
    region?: boolean,
    dependsOn?: string,
    dependsValue?: string,
    dependsOnOptions?: Array<IOption>,
    dependsOnValue?: string,
    dependsOnType?: "radio" | "checkbox" | "select",
    minDate?: string;
    maxDate?: string;
    regex?: string;
    regexMessage?: string;
    otherName?: string;
}

export interface IPages {
    id: number;
    title: string;
    description: string;
    questions: Array<IQuestion>;
}

export interface ISurveyQuestions {
    title: string | "",
    description: string | "",
    author: string | null,
    pages: Array<IPages>,
    openDate: string,
    endDate: string,
    status: "draft" | "active" | "finished",
    responses: number,
    users: number,
    completeMessage: string,
    term: Buffer,
}

export interface ISurveyQuestionsDocument extends ISurveyQuestions, Document {
    termString?: string | undefined,
    createdAt: Date;
    updatedAt: Date;
}

const optionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    value: { type: String, required: true },
    label: { type: String, required: true },
});

const rowSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    type: { type: String, enum: ["text", "radio", "checkbox", "date", "number", "select", "textarea", "rating", "dropdown", "table"], required: true },
    name: { type: String, required: true },
    options: [optionSchema],
    rows: [rowSchema],
    required: { type: Boolean, required: true, default: false },
    dependsOn: { type: String },
    dependsValue: { type: String },
    dependsOnOptions: [optionSchema],
    dependsOnValue: { type: String },
    dependsOnType: { type: String, enum: ["radio", "checkbox", "select"] },
    minDate: { type: String },
    maxDate: { type: String },
    regex: { type: String },
    regexMessage: { type: String },
    otherName: { type: String }
});

const pageSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    questions: [questionSchema],
});

const surveyQuestionsSchema: mongoose.Schema = new mongoose.Schema<ISurveyQuestionsDocument>(
    {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        author: { type: String, ref: "User", required: true },
        pages: { type: [pageSchema], required: true },
        openDate: { type: String, default: new Date().toISOString() },
        endDate: { type: String, default: new Date().toISOString() },
        status: { type: String, required: true, default: "draft" },
        responses: { type: Number, required: true, default: 0 },
        users: { type: Number, required: true, default: 0 },
        completeMessage: { type: String, default: "" },
        term: {
            type: Buffer,
            default: null,
            validate: {
                validator: function (val: any) {
                    return val === null || Buffer.isBuffer(val);
                },
                message: "Term must be a Buffer or null"
            }
        }
    }, {
    timestamps: true,
}
);

const SurveyQuestions: Model<ISurveyQuestionsDocument> =
    mongoose.models.SurveyQuestions ||
    mongoose.model<ISurveyQuestionsDocument>("SurveyQuestions", surveyQuestionsSchema);

export default SurveyQuestions;
