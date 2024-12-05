import Manage from "@/components/Survey/Manage";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { GetServerSideProps } from "next";
import Survey, { ISurvey, ISurveyDocument } from "../../../../../models/surveyModel";
import mongoose, { set } from "mongoose";
import { useEffect, useState } from "react";
import { save, updateTitle } from "../../../../../redux/reducers";
import { saveSurveyId } from "../../../../../redux/reducers/surveyId";
import { connectToMongoDB } from "@/lib/db";
import { api } from "@/lib/api";
import { Loader } from "@/components/layout/Loader";
import { Spinner } from "@nextui-org/react";


interface Props {
    id: number,
}

export default function Edit({ id }: Props) {
    const [loading, setLoading] = useState<boolean>(true);

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.survey);


    useEffect(() => {
        api.get<ISurveyDocument>('/survey/' + id).then(
            (res) => {
                dispatch(saveSurveyId(res._id as string));
                dispatch(save(res));
            }
        ).finally(() => {
            const timeout = setTimeout(() => {
                setLoading(false)
            }, 3000);
            console.log(data);
            return () => clearTimeout(timeout);
        });
    }, []);

    return loading ? <Loader /> : <Manage />
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    const { id } = context.query;

    return {
        props: {
            id: JSON.parse(JSON.stringify(id))
        }
    }
}

Edit.auth = {
    role: 'admin',
    verified: true,
    unauthorized: '/'
}