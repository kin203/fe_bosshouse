import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { addProduct, deleteProduct, getAll, getProductsNoPaginate, getProduct, updateActiveProduct, updateProduct } from '../../services/products';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';


export const useProducts = (page) => {
    const data = useQuery({
        queryKey: ['products', page],
        queryFn: () => getAll(page)
    })
    return data
}

export const useProductsNoPaginate = () => {
    const data = useQuery({
        queryKey: ['products'],
        queryFn: async () => getProductsNoPaginate()
    })
    return data
}

export const useProduct = (id) => {
    const { data } = useQuery({
        queryKey: ['products', id],
        queryFn: () => getProduct(id)
    })
    return data
}

export const useAddProduct = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })

            // Swal.fire({
            //     title: "Thêm sản phẩm thành công!",
            //     text: "That thing is still around?",
            //     icon: "success"
            // });
            // next('/admin/products')
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Xóa thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useDeleteProduct = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            });
            next('/admin/products')
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Xóa sản phẩm thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useUpdateActiveProduct = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateActiveProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            next('/admin/products')
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

export const useUpdateProduct = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })

            // Swal.fire({
            //     title: "Cập nhật sản phẩm thành công!",
            //     text: "That thing is still around?",
            //     icon: "success"
            // });
            // next('/admin/products')
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Cập nhật sản phẩm thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}