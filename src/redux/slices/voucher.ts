import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    voucherId: '',
    salePrice: 0,
    code: ''
};

const voucherSlice = createSlice({
    name: 'voucher',
    initialState,
    reducers: {
        setVoucherId: (state, action: any) => {
            state.voucherId = action.payload;
        },
        setSalePriceR: (state, action: any) => {
            state.salePrice = action.payload;
        },
        setCodeR: (state, action: any) => {
            state.code = action.payload;
        },
    },
});

export const { setVoucherId, setSalePriceR, setCodeR } = voucherSlice.actions;
export default voucherSlice.reducer;