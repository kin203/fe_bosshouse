import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customerInfo: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerInfo: (state, action) => {
      state.customerInfo = action.payload;
    },
  },
});

export const { setCustomerInfo } = customerSlice.actions;

export default customerSlice.reducer;