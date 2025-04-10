import { Link } from 'react-router-dom';
import { useGetVouchers } from '../../../hooks/apis/voucher';
import moment from 'moment';
import { getTimeRemaining } from '../../../utils/dateTime';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { deleteVoucher, deleteVoucherFromAdmin } from '../../../services/voucher';
import { IoCloseOutline } from "react-icons/io5";
import { formatCurrency } from '../../../utils/products';
import dayjs from 'dayjs';
import { Skeleton } from '@mui/material';

const ListVoucher = () => {
    const { data } = useGetVouchers();
    const [listVoucher, setListVoucher] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    document.title = "Danh sách voucher"

    useEffect(() => {
        setListVoucher(data?.data?.docs)
    }, [data]);

    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Xác nhận xóa!",
            text: "Bạn có muốn xóa voucher này không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Không",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteVoucher(id);

                    // Xóa voucher người dùng đã lưu khi admin xóa
                    await deleteVoucherFromAdmin({ voucherId: id })

                    Swal.fire({
                        title: "Xóa thành công!",
                        icon: "success"
                    })

                    setListVoucher(listVoucher.filter((item) => item._id != id));
                } catch (error) {
                    console.log(error)
                }
            }
        });
    };

    if (listVoucher?.length === 0) {
        return <>
            <div className="text-center text-3xl my-10">Danh sách voucher trống!</div>
            <Link to="/admin/voucher/add">
                <span className="bg-blue-500 text-white p-3 flex items-center justify-center text-xl my-10">Tạo voucher</span>
            </Link>
        </>
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold my-6 text-center">Danh sách Voucher</h1>
            <Link to={'/admin/voucher/add'}>
                <button className='bg-blue-500 text-white rounded mb-3 px-3 py-2 flex items-center justify-center'>Thêm voucher</button>
            </Link>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(6)].map((index) => (
                        <div key={index}>
                            <Skeleton variant='rounded' width={'100%'} height={300} />
                        </div>
                    ))}
                </div>
            ) :
                (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {listVoucher?.sort((a, b) => {
                        // Chuyển đổi createdAt thành số nếu nó không phải là số
                        const createdAtA =
                            typeof a.createdAt === "number"
                                ? a.createdAt
                                : new Date(a.createdAt).getTime();
                        const createdAtB =
                            typeof b.createdAt === "number"
                                ? b.createdAt
                                : new Date(b.createdAt).getTime();
                        return createdAtB - createdAtA;
                    })
                        ?.map((voucher, i) => (
                            <div key={i} className="relative bg-white p-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:shadow-lg hover:scale-105">
                                <span title='Xóa voucher' onClick={() => handleDelete(voucher?._id)} className='absolute text-[30px] top-2 right-2 cursor-pointer text-red-500'>
                                    <IoCloseOutline />
                                </span>

                                <Link to={`/admin/voucher/update/${voucher._id}`}>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{voucher.code}</h2>
                                    <div className='mb-2'><span className="text-sm text-gray-600 mb-2">Giảm giá: {voucher?.discountPercent}%</span> -  <span className="text-sm text-gray-600 mb-2">Tối đa: {formatCurrency(voucher?.maxDiscount)}</span> </div>
                                    <p className="text-sm text-gray-600 mb-2">Còn lại: {voucher?.maximum}</p>
                                    <p className="text-sm text-gray-600 mb-2">Bắt đầu: {dayjs(voucher?.expirationDate[0]).format("hh:mm - DD/MM/YYYY")}</p>
                                    <p className="text-sm text-gray-600 mb-2">Kết thúc: {dayjs(voucher?.expirationDate[1]).format("hh:mm - DD/MM/YYYY")}</p>
                                    <p className="text-sm text-gray-600 mb-2">{getTimeRemaining(voucher?.expirationDate[0], voucher?.expirationDate[1])}</p>
                                    <p className="text-sm text-gray-600 mb-3">Người tạo: admin</p>
                                </Link>
                            </div>
                        ))}
                </div>)
            }
        </div>
    );
};

export default ListVoucher;
