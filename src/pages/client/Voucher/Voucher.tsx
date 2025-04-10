import { useGetVoucherByUserId, useGetVouchers } from '../../../hooks/apis/voucher';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { userAddVoucher } from '../../../services/voucher';
import { formatCurrency } from '../../../utils/products';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Typography, Skeleton } from '@mui/material';

const Voucher = () => {
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
    const { data, isLoading } = useGetVouchers();
    const { data: userVoucher1 } = useGetVoucherByUserId({ userId: user?._id })
    const [listVoucher, setListVoucher] = useState([]);
    const [userVoucher, setUserVoucher] = useState([]);
    const next = useNavigate()
    document.title = "Danh sách voucher"

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        setUserVoucher(userVoucher1?.data?.codes)
    }, [userVoucher1]);

    useEffect(() => {
        setListVoucher(data?.data?.docs)
    }, [data]);

    // Kiểm tra xem voucher đã hết hạn chưa
    const isVoucherExpired = (voucher) => {
        const expirationDate = moment(voucher?.expirationDate[1]);
        const currentDate = moment();
        return expirationDate.isBefore(currentDate);
    };

    if (data?.data?.docs?.length === 0) {
        return <>
            <div className="text-center text-3xl my-10">Danh sách voucher trống!</div>
        </>
    }

    const handleSaveVoucher = async (voucher) => {
        if (!user) {
            Swal.fire({
                title: 'Bạn chưa đăng nhập!',
                icon: 'error'
            })
            return
        }
        try {
            const res = await userAddVoucher({ userId: user?._id, codeId: voucher._id, ...voucher });
            if (res.status === 200) {
                if (userVoucher) {
                    setUserVoucher(prevVouchers => [...prevVouchers, voucher]);
                } else {
                    setUserVoucher([voucher]);
                }

                // Swal.fire({
                //     icon: 'success',
                //     title: 'Đã lưu mã giảm giá!'
                // });
                toast.success("Đã lưu mã giảm giá!")

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Đã xảy ra lỗi',
                    text: 'Có lỗi xảy ra khi lưu voucher. Vui lòng thử lại sau!',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Đã xảy ra lỗi',
                text: 'Có lỗi xảy ra khi lưu voucher. Vui lòng thử lại sau!',
            });
        }
    }


    return (
        <section className="text-gray-600 body-font xl:mt-4 mt-16 min-h-[50vh]">
            <h1 className=" text-center text-gray-800 text-3xl font-bold lg:mt-0 mt-10">Mã giảm giá</h1>
            <div className="container px-4 py-5 mx-auto">
                <div className="flex flex-wrap -m-4">
                    {isLoading ? (<>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="p-3 md:w-1/3">
                                <div className="flex justify-between w-full shadow">
                                    <Skeleton variant="rectangular" width={120} height={120} />
                                    <div className="flex justify-between py-2 pl-1">
                                        <Typography className=' w-[250px] p-2'>
                                            <Skeleton />
                                            <Skeleton />
                                            <Skeleton />

                                        </Typography>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </>) : (<>
                        {listVoucher?.filter(item =>
                            moment().isBetween(moment(item?.expirationDate[0]), moment(item?.expirationDate[1]), null, '[]')
                            // ||moment().isBefore(moment(item?.expirationDate[0]))
                        )?.filter(item => item.maximum > 0)?.map((voucher, index) => (
                            <div key={index} className="p-3 md:w-1/3">
                                <div className="flex justify-around w-full shadow">
                                    <svg viewBox="0 0 106 106" fill="none" className="lg:w-[30%] w-[28%]">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0 2a2 2 0 0 1 2-2h106v106H2a2 2 0 0 1-2-2v-3a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 0 0 0-6V2Z" fill="#00bfa5"></path>
                                        <text x="10" y="50" fontFamily="Arial" fontWeight={700} fontSize="15" fill="white">Mã giảm giá</text>
                                        <text x="15" y="75" fontFamily="Arial" fontWeight={400} fontSize="14" fill="white">BossHouse</text>
                                    </svg>
                                    <div className="flex justify-between py-2 pl-1">
                                        <div className=' my-auto w-[200px] p-2'>
                                            <p className="xl:text-lg text-sm font-medium">{voucher.code}</p>
                                            <h3 className="xl:text-sm text-xs my-1">Giảm {voucher?.discountPercent}% Giảm tối đa {formatCurrency(voucher?.maxDiscount)}</h3>
                                            <h3 className="xl:text-sm text-xs my-1">Còn lại: {voucher?.maximum}</h3>
                                            <p className="xl:text-sm text-xs">HSD: {moment(voucher?.expirationDate[1]).format("DD/MM/YYYY")}</p>

                                        </div>
                                        <div className=' my-auto border-[1.5px] rounded-sm border-[#00bf86] mr-3'>
                                            {
                                                userVoucher?.some(code => code.code == voucher.code)
                                                    ? <button disabled className="p-1 text-[#00bfa5] xl:text-sm w-[68px] text-xs">Đã lưu</button>
                                                    : <button onClick={() => handleSaveVoucher(voucher)} className="p-2 bg-[#00bfa5] w-[68px] text-white xl:text-sm text-xs">Lưu</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>)}

                </div>
            </div>
        </section>
    )
}

export default Voucher;
