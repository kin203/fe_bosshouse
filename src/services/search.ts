import instance from "./config/instance"

export const SearchApi = async (keyword: string) => {
    return await instance.post(`/search`, {keyword})
}