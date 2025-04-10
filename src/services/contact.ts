import instance from "./config/instance"

export const getAllContact = async ({ page = 1 }) => {
    return await instance.get(`/contact?_page=${page}?_order=desc`)
}

export const getAllNoPaginate = async () => {
    return await instance.get(`/contact/getAllNoPaginate`)
}

export const getOneContact = async (id: string) => {
    return await instance.get(`/contact/${id}`)
}

export const addContact = async (data) => {
    return instance.post(`/contact/add`, data)
}

export const updateContact = async (data: any) => {
    return await instance.patch(`/contact/updateUser/${data._id}`, data)
}

export const updateProcessed = async (data: any) => {
    return await instance.patch(`/contact/updateProcessed/${data._id}`, data)
}

export const deleteContact = async (id: string) => {
    return await instance.delete(`/contact/delete/${id}`)
}

export const deleteManyContact = async (data: any) => {
    return await instance.post(`/contact/deleteMany`, data)
}