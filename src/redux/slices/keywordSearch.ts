import { createSlice } from '@reduxjs/toolkit';

interface Init {
    keyWordSearch: string
}

const initialState: Init = {
    keyWordSearch: '',
};

const keywordSearch = createSlice({
    name: 'keyword',
    initialState,
    reducers: {
        setKeyword: (state, action) => {
            state.keyWordSearch = action.payload;
        },
    },
});

export const { setKeyword } = keywordSearch.actions;
export default keywordSearch.reducer;