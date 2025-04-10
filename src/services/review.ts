import instance from "./config/instance"

export const getReviewsNoNavigate = async () => {
    return await instance.get(`/review`)
}
export const getReviewsByProductId = async (data: any) => {
    return await instance.post(`/review`, data)
}

export const findReview = async (data: any) => {
    return await instance.post(`/review/findReview`, data)
}

export const addReview = async (data: any) => {
    return await instance.post(`/review/add`, data)
}