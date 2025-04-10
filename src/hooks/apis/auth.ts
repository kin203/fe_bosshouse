import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { signIn, signUp } from '../../services/auth';


export const useSignIn = () => {
    const next = useNavigate()

    const data = useMutation({
        mutationFn: signIn,
        onSuccess: (res) => {
            sessionStorage.setItem('token', res.data.token)
            sessionStorage.setItem('user', JSON.stringify(res.data.findUser))
            sessionStorage.setItem('roleId', res.data.findUser.roleId)

            Swal.fire({
                title: "Đăng nhập thành công!",
                icon: "success"
            }).then(() => {
                next('/')
                window.location.reload()
            })


        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Đăng nhập không thành công!",
                text: `${errors?.response?.data?.messages}`,
                icon: "error"
            });
        }
    })
    return data
}

export const useSignUp = () => {
    const next = useNavigate()

    const data = useMutation({
        mutationFn: signUp,
        onSuccess: () => {
            Swal.fire({
                title: "Đăng ký thành công!",
                icon: "success"
            });

            next('/signin')
        },
        onError: (errors: any) => {
            console.log(errors)

            Swal.fire({
                width: '500',
                title: "Đăng ký không thành công!",
                text: `${errors?.response?.data?.messages}`,
                icon: "error"
            });
        }
    })
    return data
}

export const useFormAddUser = () => {
    const next = useNavigate()

    const data = useMutation({
        mutationFn: signUp,
        onSuccess: () => {
            Swal.fire({
                title: "Thêm tài khoản thành công!",
                text: "That thing is still around?",
                icon: "success"
            });

            next('/admin/users')
        },
        onError: (errors: any) => {
            console.log(errors)

            Swal.fire({
                width: '500',
                title: "Đăng ký không thành công!",
                text: `${errors?.response?.data?.messages}`,
                icon: "error"
            });
        }
    })
    return data
}



export const useSignIn1 = () => {
    const next = useNavigate()

    const data = useMutation({
        mutationFn: signIn,
        onSuccess: (res) => {
            sessionStorage.setItem('token', res.data.token)
            sessionStorage.setItem('user', JSON.stringify(res.data.findUser))
            sessionStorage.setItem('roles', res.data.findUser.roles)

            Swal.fire({
                title: "Đăng ký bằng gmail thành công!",
                icon: "success"
            }).then(() => {
                next('/')
                window.location.reload()
            })


        },
        onError: (errors: any) => {
            Swal.fire({
                title: "Đăng ký bằng gmail không thành công!",
                text: `${errors?.response?.data?.messages}`,
                icon: "error"
            });
        }
    })
    return data
}