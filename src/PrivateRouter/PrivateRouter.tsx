import { Navigate, Outlet } from 'react-router-dom'
import Swal from 'sweetalert2';

const PrivateRoute = ({ isAllowed, children, redirectPath = '/signin' }) => {
    if (isAllowed && !isAllowed()) {
        Swal.fire({
            title: "Bạn không có quyền truy cập!",
            text: "Vui lòng đăng nhập lại bằng tài khoản admin.",
            icon: "warning"
        });
        return <Navigate to={redirectPath} replace />
    }
    return children ? children : <Outlet />
}

export default PrivateRoute