import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getVoucherByUserId, getVouchers, updateApplyVoucher } from '../../services/voucher';


export const useGetVouchers = () => {
    const data = useQuery({
        queryKey: ['voucher'],
        queryFn: () => getVouchers()
    })
    return data
}

export const useGetVoucherByUserId = (id) => {
    const data = useQuery({
        queryKey: ['voucherByUserId', id],
        queryFn: () => getVoucherByUserId(id)
    })
    return data
}

export const useUpdateApplyVoucher = () => {
    const queryClient = useQueryClient()

    const data = useMutation({
        mutationFn: updateApplyVoucher,
        onSuccess: (e) => {
            console.log(e)
            queryClient.invalidateQueries({ queryKey: ['voucherByUserId'] })
        },
        onError: (errors: any) => {
            console.log(errors)
        }
    })
    return data
}