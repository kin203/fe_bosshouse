import instance from "./config/instance"

export const getAll = async () => {
    return await instance.get(`/userAddress`)
}

export const findByUserId = async (data) => {
    return await instance.post(`/userAddress/findByUserId`, data)
}

export const addUserAddress = async (data) => {
    return await instance.post(`/userAddress/add`, data)
}

export const updateUserAddress = async (data) => {
    return await instance.patch(`/userAddress/update/${data._id}`, data)
}

export const deleteUserAddress = async (id) => {
    return await instance.delete(`/userAddress/delete/${id}`)
}