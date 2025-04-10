import instance from "./config/instance"

const apiPostRefund = import.meta.env.VITE_REACT_APP_VNP_API_REFUND

export const createPaymentVnPay = async (data: any) => {
    return await instance.post(`/vnpay`, data)
}

export const vnPayRefund = async (data: any) => {
    return await instance.post(`/vnpay/refund`, data)
}

export const vnPayQuery = async (data: any) => {
    return await instance.post(`/vnpay/query`, data)
}