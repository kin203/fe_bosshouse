import instance from "./config/instance"

export const getAll = async ({page = 1, limit = 10 }) => {
    return await instance.get(`/products?_page=${page}&_limit=${limit}&_order=desc`)
}

export const getProductsNoPaginate = async () => {
    return await instance.get(`/products/getProductsNoPaginate`)
}

export const addProduct = async (data: IProduct) => {
    return await instance.post('/products/add', data)
}

export const getProduct = async (id: string) => {
    return await instance.get(`/products/${id}`)
}

export const updateProduct = async (data: IProduct | any) => {
    return await instance.patch(`/products/update/${data._id}`, data)
}

export const updateActiveProduct = async (data: IProduct | any) => {
    return await instance.patch(`/products/updateActive/${data._id}`, data)
}

export const deleteProduct = async (id: string) => {
    return await instance.delete(`/products/delete/${id}`)
}

export const deleteManyProduct = async (data: any) => {
    return await instance.post(`/products/deleteMany`, data)
}

export const updateManyQuantity = async (data: any) => {
    return await instance.post(`/products/updateManyQuantity`, data)
}