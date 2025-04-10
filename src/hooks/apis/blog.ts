import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addBlog, deleteBlog, getAllBlog, getAllBlogNoPaginate, getBlog, updateBlog } from '../../services/blog';


export const useBlog = (page) => {
    const data = useQuery({
        queryKey: ['blog', page],
        queryFn: () => getAllBlog(page)
    })
    return data
}


export const useBlogNoPaginate = () => {
    const data = useQuery({
        queryKey: ['blogNoPaginate'],
        queryFn: () => getAllBlogNoPaginate()
    })
    return data
}


export const useBlogID = (id) => {
    const { data } = useQuery({
        queryKey: ['blog', id],
        queryFn: () => getBlog(id)
    })
    return data
}

export const useAddBlog = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addBlog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog'] })
            Swal.fire({
                title: "Thêm bài viết thành công!",
                icon: "success"
            });
            next('/admin/blog')
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Thêm bài viết thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useUpdateBlog = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateBlog,
        onSuccess: () => {
            next('/admin/blog')
            queryClient.invalidateQueries({ queryKey: ['blog'] })

            Swal.fire({
                title: "Cập nhật bài viết thành công!",
                icon: "success"
            });
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Cập nhật bài viết thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useDeleteBlog = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteBlog,
        onSuccess: () => {
            next('/admin/blog')
            queryClient.invalidateQueries({ queryKey: ['blog'] })

            Swal.fire({
                title: "Xóa bài viết thành công!",
                text: "That thing is still around?",
                icon: "success"
            });
        },
        onError: (errors: any) => {
            console.log(errors)
            Swal.fire({
                title: "Xóa thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}