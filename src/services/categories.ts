import instance from "./config/instance"


export const getAllCategory = async ({page = 1}) => {
    return await instance.get(`/category?_page=${page}?_order=desc`)
}

export const getAllCategoryNoPaginate = async () => {
    return await instance.get(`/category/getAllNoPaginate`)
}

export const getAllCategoryNoPaginateDetail = async () => {
    return await instance.get(`/category/getAllNoPaginateDetail`)
}

export const getCategory = async (id: string) => {
    return await instance.get(`/category/${id}`)
}

export const addCategory = async (data: IProduct) => {
    return await instance.post('/category/add', data)
}

export const updateCategory = async (data: any) => {
    return await instance.patch(`/category/update/${data?._id}`, data)
}

export const updateActiveCategory = async (data: IProduct | any) => {
    return await instance.patch(`/category/updateActive/${data._id}`, data)
}

export const deleteCategory = async (id: string) => {
    return await instance.delete(`/category/delete/${id}`)
}

export const deleteManyCategory = async (category: any) => {
    return await instance.post(`/category/deleteManyCategory`, category)
}