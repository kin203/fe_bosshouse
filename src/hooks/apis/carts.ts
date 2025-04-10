import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { addProduct, deleteProduct, getAll, getProduct, updateActiveProduct, updateProduct } from '../../services/products';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addCart, getCartByUserId, updateCartByUserId } from '../../services/cart';

export const useGetCartByUserId = (id) => {
    const data = useQuery({
        queryKey: ['useGetCartByUserId', id],
        queryFn: () => getCartByUserId(id)
    })
    return data
}

export const useAddCart = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['useGetCartByUserId'] })

            Swal.fire({
                title: 'Thêm giỏ hàng thành công!',
                icon: 'success'
            })
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Thêm thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useAddCartPayNow = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['useGetCartByUserId'] })
        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Thêm thất bại!",
                text: errors?.response?.data?.message,
                icon: "error"
            })
        }
    })
    return data
}

export const useUpdateCartByUserId = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateCartByUserId,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['useGetCartByUserId'] })
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