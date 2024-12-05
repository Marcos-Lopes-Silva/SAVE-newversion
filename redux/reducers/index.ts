import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPages, ISurvey, ISurveyDocument } from "../../models/surveyModel";

const initialState: ISurvey = {
    title: "",
    description: "",
    author: null,
    pages: [],
    openDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: "draft",
    responses: 0,
    users: 0,
    completeMessage: "",
}

const surveySlice = createSlice({
    name: 'survey',
    initialState,
    reducers: {
        clear: (state) => {
            state = initialState;
        },
        save: (state, action: PayloadAction<ISurvey>) => {
            return action.payload;
        },
        updateTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },
        updateDescription(state, action: PayloadAction<string>) {
            state.description = action.payload;
        },
        addPage(state, action: PayloadAction<IPages>) {
            state.pages.push(action.payload);
        },
        updatePage(state, action: PayloadAction<{ pageId: number, updatedPage: Partial<IPages> }>) {
            const { pageId, updatedPage } = action.payload;
            const pageIndex = state.pages.findIndex(page => page.id === pageId);
            if (pageIndex !== -1) {
                state.pages[pageIndex] = { ...state.pages[pageIndex], ...updatedPage };
            }
        },
        removePage(state, action: PayloadAction<number>) {
            state.pages = state.pages.filter(page => page.id !== action.payload);
        },
        updateStatus(state, action: PayloadAction<"draft" | "active" | "finished">) {
            state.status = action.payload;
        },
        updateAuthor(state, action: PayloadAction<string | null>) {
            state.author = action.payload;
        },
    }
});



export const { 
    clear,
    save,
    updateTitle,
    updateDescription,
    addPage,
    updatePage,
    removePage,
    updateStatus,
    updateAuthor  
} = surveySlice.actions;

export default surveySlice.reducer;