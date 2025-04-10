import { configureStore } from '@reduxjs/toolkit';
import { keywordSearch, listProductCartSelected, infoOrder, cart, voucherSlice, selectedCategory, reloadSlice } from './rootReducer';

export const store = configureStore({
    reducer: {
        keyword: keywordSearch,
        listProductCartSelected: listProductCartSelected,
        infoOrder: infoOrder,
        cart: cart,
        voucher: voucherSlice,
        selectedCategory: selectedCategory,
        reload: reloadSlice
    },
});