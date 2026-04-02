import Survey from "../../../../models/surveyModel";
import { GetServerSideProps } from "next"
import { ISurveyDocument } from "../../../../models/surveyModel";
import SurveyBody from "@/components/Survey/Body";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";
import SurveyResult from "../../../../models/surveyResultModel";
import { getSession } from "next-auth/react";

interface Props {
    survey: ISurveyDocument;
    responses: Object;
    term: boolean;
}

export default function SurveyUser({ survey, responses, term }: Props) {
    return <SurveyBody responses={responses} survey={survey} term={term} />
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    await connectToMongoDB();
    const session = await getSession(context);

    const { id } = context.query;
    const survey = await Survey.findById(new mongoose.Types.ObjectId(id as string));
    const responses = await SurveyResult.findOne({ surveyId: id as string, userId: session?.user?._id });

    const surveyData = JSON.parse(JSON.stringify(survey));
    if (survey?.term) {
        surveyData.term = survey.term.toString('base64');
    }

    if (!responses) {
        const responses = await SurveyResult.find({ userId: session?.user?._id });


        return {
            props: {
                survey: surveyData,
                responses: JSON.parse(JSON.stringify(responses[responses.length - 1]?.surveyResult ?? {}))
            }
        }
    }

    return {
        props: {
            survey: surveyData,
            responses: JSON.parse(JSON.stringify(responses?.surveyResult ?? {})),
            term: JSON.parse(JSON.stringify(responses.termsAccepted ?? false))
        }
    }
}


SurveyUser.auth = {
    role: 'user',
    unauthorized: '/'
};