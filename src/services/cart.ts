import instance from "./config/instance";

export const addCart = (data) => {
    return instance.post(`/cart/add`, data);
};

export const getCartByUserId = (data) => {
    return instance.post(`/cart/getCartByUserId`, data);
};

export const updateCartByUserId = (data) => {
    return instance.post(`/cart/updateCartByUserId`, data);
};

export const deleteCart = (data) => {
    return instance.post(`/cart/deleteCart`, data);
};

export const updateProductCartFromAdmin = (data) => {
    return instance.post(`/cart/updateProductCartFromAdmin`, data);
};

export const deleteProductCartFromAdmin = (data) => {
    return instance.post(`/cart/deleteProductCartFromAdmin`, data);
};