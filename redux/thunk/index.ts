import { ThunkAction } from "redux-thunk";
import { IPages, ISurvey, ISurveyDocument } from "../../models/surveyModel";
import { updateDescription, updatePage, updateTitle } from "../reducers";
import { RootState } from "../store";
import { UnknownAction } from "redux";
import { setLoading, setQuestionId, setSuccess } from "../reducers/loading";
import { api } from "@/lib/api";
import { saveSurveyId } from "../reducers/surveyId";

export const updatePageAndSync = (page: IPages, pageId: number, surveyId?: string): ThunkAction<void, RootState, unknown, UnknownAction> => {

    return async (dispatch, getState) => {
        try {
            const { loading } = getState();
            if (loading.isLoading) return;

            dispatch(setLoading(true));

            dispatch(updatePage({ pageId, updatedPage: page }));

            const state = getState();

            if (surveyId) {
                await api.patch<ISurveyDocument>(`survey/${surveyId}`, state.survey);
            } else {
                const response = await api.post<ISurveyDocument>('survey/create', state.survey);
                dispatch(saveSurveyId(response._id as string));
            }
            dispatch(setSuccess(true));
        } catch (error) {
            console.error(error);
            dispatch(setSuccess(false));
        } finally {
            setTimeout(() => {
                dispatch(setLoading(false));
            }, 1000);
            setTimeout(() => {
                dispatch(setQuestionId(0));
            }, 2000);
        }
    };
};


export const updateSurveyAndSync = (survey: ISurvey, surveyId?: string): ThunkAction<void, RootState, unknown, UnknownAction> => {
    return async (dispatch) => {
        dispatch(setLoading(true));
        try {

            dispatch(updateTitle(survey.title));
            dispatch(updateDescription(survey.description));

            if (surveyId) {
                await api.patch<ISurveyDocument>(`survey/${surveyId}`, survey);
            } else {
                const response = await api.post<ISurveyDocument>('survey/create', survey);
                dispatch(saveSurveyId(response._id as string));
            }

            dispatch(setSuccess(true));
        } catch (error) {
            console.error(error);
            dispatch(setSuccess(false));
        } finally {
            setTimeout(() => {
                dispatch(setLoading(false));
            }, 1200);
        }
    };
}