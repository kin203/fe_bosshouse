import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addCategory, deleteCategory, getAllCategory, getAllCategoryNoPaginate, getCategory, updateCategory } from '../../services/categories';
import Swal from 'sweetalert2';

export const useCategoryNoPaginate = () => {
    const data = useQuery({
        queryKey: ['categoryNoPaginate'],
        queryFn: () => getAllCategoryNoPaginate()
    })
    return data

}

export const useCategory = (page) => {
    const data = useQuery({
        queryKey: ['category', page],
        queryFn: () => getAllCategory(page)
    })
    return data
}

export const useCategoryID = (id) => {
    const data = useQuery({
        queryKey: ['category', id],
        queryFn: () => getCategory(id)
    })
    return data
}

export const useAddCategory = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category'] })
            Swal.fire({
                title: "Thêm danh mục thành công!",
                icon: "success"
            });
            next('/admin/category')
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Thêm danh mục thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useUpdateCategory = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            next('/admin/category')
            queryClient.invalidateQueries({ queryKey: ['category'] })

            Swal.fire({
                title: "Cập nhật danh mục thành công!",
                icon: "success"
            });
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Cập nhật danh mục thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useDeleteCategory = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            next('/admin/category')
            queryClient.invalidateQueries({ queryKey: ['category'] })

            Swal.fire({
                title: "Xóa danh mục thành công!",
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