import instance from "./config/instance"


export const getAllBlog = async ({page = 1}) => {
    return await instance.get(`/blog?_page=${page}`)
}

export const getAllBlogNoPaginate = async () => {
    return await instance.get(`/blog/getAllBlogNoPaginate`)
}

export const getBlog = async (id: string) => {
    return await instance.get(`/blog/${id}`)
}

export const addBlog = async (data: IProduct) => {
    return await instance.post('/blog/add', data)
}

export const updateBlog = async (data: any) => {
    return await instance.patch(`/blog/update/${data?._id}`, data)
}

export const deleteBlog = async (id: string) => {
    return await instance.delete(`/blog/delete/${id}`)
}

export const deleteManyBlog = async (blog: any) => {
    return await instance.post(`/blog/deleteManyBlog`, blog)
}