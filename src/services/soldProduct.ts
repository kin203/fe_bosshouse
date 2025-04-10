import instance from "./config/instance"

export const getAll = async () => {
    return await instance.get(`/soldProduct`)
}

export const addSoldProduct = async (data) => {
    return await instance.post(`/soldProduct/add`, data)
}

export const getSoldProductId = async (data) => {
    return await instance.post(`/soldProduct/getProductId`, data)
}