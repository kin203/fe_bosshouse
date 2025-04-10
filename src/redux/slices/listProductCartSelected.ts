import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    listProductCartSelected: null,
    lastPrice: 0
};

const listProductCartSelected = createSlice({
    name: 'listProductCart',
    initialState,
    reducers: {
        setListProductCartSelected: (state, action) => {
            state.listProductCartSelected = action.payload;
        },
        setLastPriceCart: (state, action) => {
            state.lastPrice = action.payload;
        },
    },
});

export const { setListProductCartSelected, setLastPriceCart } = listProductCartSelected.actions;
export default listProductCartSelected.reducer;