import instance from "./config/instance"

export const getAll = async () => {
    return await instance.get(`/role`)
}

export const getOne = async (id) => {
    return await instance.get(`/role/${id}`)
}

export const updateRole = async (data) => {
    return await instance.patch(`/role/update/${data._id}`, data)
}

export const addRole = async (data) => {
    return await instance.post(`/role/add`, data)
}

export const deleteRoleApi = async (id) => {
    return await instance.delete(`/role/delete/${id}`)
}