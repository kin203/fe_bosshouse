import { createSlice } from '@reduxjs/toolkit';

const reloadSlice = createSlice({
    name: 'reload',
    initialState: false,
    reducers: {
        setReload: (state, action) => action.payload,
    },
});

export const { setReload } = reloadSlice.actions;
export default reloadSlice.reducer;
