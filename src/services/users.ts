import instance from "./config/instance"

export const getAllUsers = async ({page = 1}) => {
    return await instance.get(`/users?_page=${page}`)
}

export const getAllNoPaginate = async () => {
    return await instance.get(`/users/getAllNoPaginate`)
}

export const getOneUsers = async (id: string) => {
    return await instance.get(`/users/${id}`)
}

export const getByEmail = async (data) => {
    return await instance.post(`/users/getByEmail`, data)
}


export const updateUsers = async (data: any) => {
    return await instance.patch(`/users/updateUser/${data._id}`, data)
}

// export const updateActiveUsers = async (data: IPUsers | any) => {
//     return await instance.patch(`/users/updateActive/${data._id}`, data)
// }

export const deleteUsers = async (id: string) => {
    return await instance.delete(`/users/deleteUser/${id}`)
}

export const deleteManyUsers = async (data: any) => {
    return await instance.post(`/users/deleteManyUser`, data)
}