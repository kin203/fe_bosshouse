import instance from "./config/instance"

export const getVouchers = async () => {
    return await instance.get('/voucher')
}
export const getVoucher = async (id) => {
    return await instance.get('/voucher/' + id)
}
export const addVoucher = async (data: any) => {
    return await instance.post('/voucher/add', data)
}
export const updateVoucher = async (id: any, data: any) => {
    return await instance.put(`/voucher/update/${id}`, data)
}
export const applyVoucherAPI = async (data: any) => {
    return await instance.post('/voucher/applyVoucher', data)
}
export const deleteVoucher = async (id) => {
    return await instance.delete('/voucher/delete/' + id)
}

// Client
export const getVoucherByUserId = async (data) => {
    return await instance.post(`/voucher/getVoucherByUserId`, data)
}
export const userAddVoucher = async (data) => {
    return await instance.post(`/voucher/userAdd`, data)
}

export const updateApplyVoucher = async (data) => {
    return await instance.post(`/voucher/updateApplyVoucher`, data)
}

// admin
export const updateVoucherFromAdmin = async (data) => {
    return await instance.post(`/voucher/updateVoucherFromAdmin`, data)
}

export const deleteVoucherFromAdmin = async (data) => {
    return await instance.post(`/voucher/deleteVoucherFromAdmin`, data)
}