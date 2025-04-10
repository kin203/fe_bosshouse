import instance from "./config/instance"


export const getAll = async () => {
    return await instance.get(`/refundHistory`)
}

export const getOne = async (id: string) => {
    return await instance.get(`/refundHistory/${id}`)
}

export const addRefund = async (data) => {
    return await instance.post(`/refundHistory/addRefund`, data)
}