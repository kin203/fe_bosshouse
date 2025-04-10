import { useQuery } from '@tanstack/react-query';
import { getAll, getSoldProductId } from '../../services/soldProduct';

export const useGetAllSoldProduct = () => {
    const data = useQuery({
        queryKey: ['soldProducts'],
        queryFn: () => getAll()
    })
    return data
}

export const useGetSoldProductId = (id) => {
    const data = useQuery({
        queryKey: ['soldProduct', id],
        queryFn: () => getSoldProductId(id)
    })
    return data
}

// export const useAddProduct = () => {
//     const next = useNavigate()
//     const queryClient = useQueryClient()

//     const data = useMutation({
//         mutationFn: addProduct,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['products'] })

//             Swal.fire({
//                 title: "Thêm sản phẩm thành công!",
//                 text: "That thing is still around?",
//                 icon: "success"
//             });
//             next('/admin/products')
//         },
//         onError: (errors: any) => {
//             Swal.fire({
//                 title: "Xóa thất bại!",
//                 text: errors?.response?.data?.message,
//                 icon: "error"
//             })
//         }
//     })
//     return data
// }