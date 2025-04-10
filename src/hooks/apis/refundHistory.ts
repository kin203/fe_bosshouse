import { useQuery } from '@tanstack/react-query';
import { getAll } from '../../services/refundHistory';

export const useGetRefundHistory = () => {
    const data = useQuery({
        queryKey: ['refundH'],
        queryFn: () => getAll()
    })
    return data
}