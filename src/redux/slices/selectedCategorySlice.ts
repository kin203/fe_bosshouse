import { createSlice } from '@reduxjs/toolkit';

const selectedCategorySlice = createSlice({
    name: 'selectedCategory',
    initialState: null,
    reducers: {
        selectCategory: (state, action) => action.payload,
        resetCategory: () => null,
    },
});

export const { selectCategory, resetCategory } = selectedCategorySlice.actions;

export default selectedCategorySlice.reducer;