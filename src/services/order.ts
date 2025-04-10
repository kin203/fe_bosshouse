import instance from "./config/instance"

export const getOrders = async ({ page = 1 }) => {
    return await instance.get(`/order?_page=${page}&_order=desc`)
}

export const getOrder = async (id) => {
    return await instance.get(`/order/${id}`)
}

export const getOrderByOrderCode = async (data) => {
    return await instance.post(`/order/getOrderByOrderCode`, data)
}

export const getAllOrderNoPaginate = async () => {
    return await instance.get(`/order/getAllOrderNoPaginate`)
}

export const getListOrderByUserId = async (userId: any) => {
    return await instance.post(`/order`, userId)
}

export const addOrder = async (data: any) => {
    return await instance.post(`/order/add`, data)
}

export const updateOrder = async (data: any) => {
    return await instance.post(`/order/update`, data)
}

export const updateOrderProduct = async (data: any) => {
    return await instance.patch(`/order/updateOrderProduct/${data?._id}`, data)
}

export const deleteOrder = async (data: any) => {
    return await instance.post(`/order/delete`, data)
}

export const deleteManyOrder = async (data: any) => {
    return await instance.post(`/order/deleteMany`, data)
}