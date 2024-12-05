import { createSlice, PayloadAction } from "@reduxjs/toolkit";




const surveyIdSlice = createSlice({
    name: 'surveyId',
    initialState : { value: "" },
    reducers: {
        saveSurveyId(state, action: PayloadAction<string>) {
            state.value = action.payload;
        },
        clearSurveyId(state) {
            state.value = "";
        }
    }
});

export const { saveSurveyId } = surveyIdSlice.actions;
export default surveyIdSlice.reducer;