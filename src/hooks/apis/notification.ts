import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addBlog, deleteBlog, getAllBlog, getBlog, updateBlog } from '../../services/blog';
import { getAllToAdmin } from '../../services/notification';


export const useNotificationToAdmin = () => {
    const data = useQuery({
        queryKey: ['getAllToAdmin'],
        queryFn: () => getAllToAdmin()
    })
    return data
}

// export const useBlogID = (id) => {
//     const { data } = useQuery({
//         queryKey: ['blog', id],
//         queryFn: () => getBlog(id)
//     })
//     return data
// }