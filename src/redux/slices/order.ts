import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    infoOrder: null,
    priceOrder: 0,
    orderInfo: "db0c87d8-ff9a-4125-acb7-d3d74b345100"
};

const infoOrder = createSlice({
    name: 'keyword',
    initialState,
    reducers: {
        setInfoOrderR: (state, action: any) => {
            state.infoOrder = action.payload;
        },
        setPriceOrder: (state, action: any) => {
            state.priceOrder = action.payload;
        },
        setOrderInfo: (state, action) => {
            state.orderInfo = action.payload;
        },
    },
});

export const { setInfoOrderR, setPriceOrder, setOrderInfo } = infoOrder.actions;
export default infoOrder.reducer;