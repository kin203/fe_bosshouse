import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartQuantity: 0,
    RepuchaseListProductChecked: null
};

const Cart = createSlice({
    name: 'cartQuantity',
    initialState,
    reducers: {
        setCartQuantity: (state, action) => {
            state.cartQuantity = action.payload;
        },
        setRepuchaseListProductChecked: (state, action) => {
            state.RepuchaseListProductChecked = action.payload;
        }
    },
});

export const { setCartQuantity, setRepuchaseListProductChecked } = Cart.actions;
export default Cart.reducer;