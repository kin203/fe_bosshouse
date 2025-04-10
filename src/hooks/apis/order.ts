import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addOrder, deleteOrder, getAllOrderNoPaginate, getListOrderByUserId, getOrder, getOrders } from '../../services/order';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const useGetAllOrder = ({page}) => {
    const data = useQuery({
        queryKey: ['orders', page],
        queryFn: () => getOrders({page: page})
    })
    return data
}

export const useGetAllOrderNoPaginate = () => {
    const data = useQuery({
        queryKey: ['getOrdersNoPaginate'],
        queryFn: () => getAllOrderNoPaginate()
    })
    return data
}

export const useGetOrder = (id) => {
    const data = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(id)
    })
    return data
}

export const useGetOrderByUserId = (id) => {
    const data = useQuery({
        queryKey: ['orderById', id],
        queryFn: () => getListOrderByUserId(id)
    })
    return data
}

export const useAddOrder = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: addOrder,
        onSuccess: (e) => {
            queryClient.invalidateQueries({ queryKey: ['orders', 'getOrdersNoPaginate', "orderById"] })
            // console.log(e?.data?.newOrder?._id)
            return e
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}

export const useDeleteOrder = () => {
    const next = useNavigate()
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: deleteOrder,
        onSuccess: (e) => {
            queryClient.invalidateQueries({ queryKey: ['orders', 'getOrdersNoPaginate', "orderById"] })
            // console.log(e?.data?.newOrder?._id)
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}