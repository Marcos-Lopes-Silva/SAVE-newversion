import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
    isLoading: boolean;
    success: boolean;
    questionId: number;
}

const initialState: LoadingState = {
    isLoading: false,
    success: false,
    questionId: 0
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setSuccess(state, action: PayloadAction<boolean>) {
            state.success = action.payload;
        },
        setQuestionId(state, action: PayloadAction<number>) {
            state.questionId = action.payload;
        }
    }
});

export const { setLoading, setSuccess, setQuestionId } = loadingSlice.actions;
export default loadingSlice.reducer;
