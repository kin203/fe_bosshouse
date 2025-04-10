import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteUsers, getAllNoPaginate, getOneUsers, updateUsers } from '../../services/users';
import { signUp } from '../../services/auth';


export const useUsers = () => {
    const data = useQuery({
        queryKey: ['usersNoPaginate'],
        queryFn: async () => getAllNoPaginate()
    })
    return data
}

export const useUser = (id: any) => {
    const data = useQuery({
        queryKey: ['user', id],
        queryFn: () => getOneUsers(id)
    })
    return data
}

export const useAddUsers = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: signUp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })

            Swal.fire({
                title: "Thêm tài khoản thành công!",
                text: "That thing is still around?",
                icon: "success"
            });
            next('/admin/users')
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

export const useDeleteUsers = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteUsers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            });
            next('/admin/users')
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

// export const useUpdateActiveProduct = () => {
//     const next = useNavigate()
//     const queryClient = useQueryClient()

//     const data = useMutation({
//         mutationFn: updateActiveProduct,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['users'] })
//             next('/admin/users')
//         },
//         onError: (errors: any) => {
//             console.log(errors)
//         }
//     })
//     return data
// }

export const useUpdateUsers = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateUsers,
        onSuccess: () => {
            next('/admin/users')
            queryClient.invalidateQueries({ queryKey: ['user'] })

            Swal.fire({
                title: "Cập nhật tài khoản thành công!",
                icon: "success"
            });
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

