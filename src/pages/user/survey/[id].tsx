import Survey from "../../../../models/surveyModel";
import { GetServerSideProps } from "next"
import { ISurveyDocument } from "../../../../models/surveyModel";
import SurveyBody from "@/components/Survey/Body";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";
import SurveyResult from "../../../../models/surveyResults";
import { getSession } from "next-auth/react";

interface Props {
    survey: ISurveyDocument;
    responses: Object;
}

export default function SurveyUser({ survey, responses }: Props) {
    return <SurveyBody responses={responses} survey={survey} />
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    await connectToMongoDB();
    const session = await getSession(context);

    const { id } = context.query;
    const survey = await Survey.findById(new mongoose.Types.ObjectId(id as string));
    const responses = await SurveyResult.findOne({ surveyId: id as string, userId: session?.user?._id });

    if (!responses) {
        const responses = await SurveyResult.findOne({ userId: session?.user?._id });
        return {
            props: {
                survey: JSON.parse(JSON.stringify(survey)),
                responses: JSON.parse(JSON.stringify(responses?.surveyResult ?? {}))
            }
        }
    }

    return {
        props: {
            survey: JSON.parse(JSON.stringify(survey)),
            responses: JSON.parse(JSON.stringify(responses?.surveyResult ?? {}))
        }
    }
}