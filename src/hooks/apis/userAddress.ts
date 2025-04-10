import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addCategory, deleteCategory, getAllCategory, getAllCategoryNoPaginate, getCategory, updateCategory } from '../../services/categories';
import Swal from 'sweetalert2';
import { addUserAddress, deleteUserAddress, findByUserId, getAll, updateUserAddress } from '../../services/userAddress';

export const useUserAddress = () => {
    const data = useQuery({
        queryKey: ['userAddress'],
        queryFn: () => getAll()
    })
    return data
}

export const useFindUserAddressByUserId = (id) => {
    const data = useQuery({
        queryKey: ['userAddress'],
        queryFn: () => findByUserId(id)
    })
    return data
}

export const useAddUserAddress = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addUserAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAddress'] })

            Swal.fire({
                title: "Thêm địa chỉ thành công!",
                icon: "success",
            })
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

export const useUpdateUserAddress = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateUserAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAddress'] })

            Swal.fire({
                title: "Cập nhật địa chỉ thành công!",
                icon: "success",
            })
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

export const useDeleteUserAddress = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteUserAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAddress'] })

            Swal.fire({
                title: "Xóa địa chỉ thành công!",
                icon: "success",
            })
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}