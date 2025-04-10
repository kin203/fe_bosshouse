import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAll, getOne, updateRole } from '../../services/roles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


export const useGetRoles = () => {
    const data = useQuery({
        queryKey: ['roles'],
        queryFn: () => getAll()
    })
    return data
}

export const useRole = (id) => {
    const data = useQuery({
        queryKey: ['role', id],
        queryFn: () => getOne(id)
    })
    return data
}

export const useUpdateRole = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateRole,
        onSuccess: () => {
            next("/admin/access")
            queryClient.invalidateQueries({ queryKey: ['role'] })

            Swal.fire({
                title: "Cập nhật vai thành công!",
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