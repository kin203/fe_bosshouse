import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addContact, deleteContact, getAllContact, getAllNoPaginate, updateContact } from '../../services/contact';
import { signUp } from '../../services/auth';


export const useContactNoPaginate = () => {
    const data = useQuery({
        queryKey: ['contactNoPaginate'],
        queryFn: () => getAllNoPaginate()
    })
    return data
}

export const useAddContact = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })

            Swal.fire({
                title: "Gửi thành công!",
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

export const useDeleteContact = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteContact,
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

export const useUpdateContact = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateContact,
        onSuccess: () => {
            next('/admin/users')
            queryClient.invalidateQueries({ queryKey: ['users'] })

            Swal.fire({
                title: "Cập nhật tài khoản thành công!",
                text: "That thing is still around?",
                icon: "success"
            });
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}