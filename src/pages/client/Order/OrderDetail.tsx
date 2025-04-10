import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from '../../../redux/slices/Reload';
import { formatCurrency } from '../../../utils/products';
import { useGetOrderByUserId } from "../../../hooks/apis/order";
import { getAllOrderNoPaginate } from '../../../services/order';

const OrderDetail = () => {
    const { id } = useParams();
    const [detailOrder, setDetailCategory] = useState<any>();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllOrderNoPaginate();
            const item = response?.data?.find(i => i._id === id);
            console.log(item)
            setDetailCategory(item);
        };
        fetchData();
    }, [id]);

    return (
        <>
            <div className="md:p-10">
                <div className="grid grid-cols-1 gap-4 xl:pt-6 pt-16 xl:mx-44 mx-4 pb-20">
                    <div className="bg-white pb-3 shadow overflow-hidden sm:rounded-lg">
                        <div className='px-4 py-2 flex justify-between items-center'>
                            {
                                detailOrder?.products[0]?.status !== 'Xác Nhận Hủy Đơn Hàng' && detailOrder?.products[0]?.status !== 'Hủy Đơn Hàng' ? (
                                    <div className="">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Địa Chỉ Nhận Hàng</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Họ tên người nhận: {detailOrder?.fullName}</p>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Email: {detailOrder?.email}</p>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Số điện thoại: 0{detailOrder?.phoneNumber}</p>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Thời gian đặt hàng: {moment(detailOrder?.createdAt).format("HH:mm - DD/MM/YYYY")}{" "}</p>
                                    </div>
                                ) : (<div>
                                    <p className='font-semibold text-[red] text-xl'>Đã hủy đơn hàng</p>
                                    <p className='font-medium'>vào {moment(detailOrder?.createdAt).format("HH:mm - DD/MM/YYYY")}{" "}.</p>
                                </div>)

                            }
                        </div>
                    </div>

                    <div>
                        <div className="bg-white pb-3 shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-2 lg:py-0!important">
                                <h3 className="text-lg leading-10 font-medium text-gray-900">Sản phẩm</h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <div className="sm:divide-y sm:divide-gray-200">
                                    {detailOrder?.products?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between mb-2">
                                            <Link to={`/products/detail/${item?.productId || item?._id}`}>
                                                <div className="flex items-center">
                                                    <img src={item?.initImageProduct} alt="img" className="h-16 w-16 rounded mr-4" />
                                                    <div>
                                                        <p className="font-semibold">{item?.initNameProduct}</p>
                                                        <p className="text-gray-600 text-xs">Phân loại: {item?.selectedSize}</p>
                                                        <p className="text-gray-600 text-xs">Số lượng: {item?.selectedQuantity}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div>
                                                <span className="font-medium">{formatCurrency(item?.initPriceProduct)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                {
                                    detailOrder?.products[0]?.status !== 'Xác Nhận Hủy Đơn Hàng' && detailOrder?.products[0]?.status !== 'Hủy Đơn Hàng' ? (
                                        <div>
                                            <div className="total flex items-center justify-between px-4 mb-2">
                                                <p className='font-semibold'>Tổng tiền hàng </p>
                                                <span className='font-medium'>{formatCurrency(detailOrder?.products.reduce((a, b) => a + b.initPriceProduct * b.selectedQuantity, 0))}</span>
                                            </div>
                                            <div className="text-sm total flex items-center justify-between px-4 mb-2">
                                                <p className='font-semibold'>Giảm giá </p>
                                                <span className='font-medium'>- {formatCurrency(detailOrder?.salePrice)}</span>
                                            </div>
                                            <div className="text-sm flex items-center justify-between px-4 mb-2">
                                                <p className='font-medium'>Phí vận chuyển </p>
                                                <span className=''>{formatCurrency(detailOrder?.transportFee)}</span>
                                            </div>
                                            <div className="total flex items-center justify-between px-4 mb-2">
                                                <p className='font-semibold'>Tổng tiền </p>
                                                <span className='font-medium text-[red]'>{formatCurrency(detailOrder?.totalPrice)}</span>
                                            </div>
                                            <div className="border-t px-4 py-2 border-gray-200">
                                                <div className="sm:divide-y sm:divide-gray-200">
                                                    {detailOrder?.products[0]?.paymentMethod !== 'Thanh toán qua VnPay' && (
                                                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                                            <h3 className="text-sm font-medium ">Vui lòng thanh toán <span className='text-[red]'>{formatCurrency(detailOrder?.totalPrice)}</span> khi nhận hàng.</h3>
                                                        </div>
                                                    )}
                                                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                                        <h3 className="text-sm font-medium ">Phương thức thanh toán</h3>
                                                        <p className="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                            {detailOrder?.products[0]?.paymentMethod}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (<div>
                                        <div className="total flex items-center justify-between px-4 mb-2">
                                            <p className='font-semibold'>Yêu cầu bởi </p>
                                            <span className='font-medium'>Người mua</span>
                                        </div>
                                        <div className="text-sm total flex items-center justify-between px-4 mb-2">
                                            <p className='font-semibold'>Phương thức thanh toán </p>
                                            <span className='font-medium'> {detailOrder?.products[0]?.paymentMethod}</span>
                                        </div>
                                        <div className="text-sm flex items-center justify-between px-4 mb-2">
                                            <p className='font-medium'>Mã đơn hàng </p>
                                            <span className='font-medium'>{detailOrder?.orderCode}</span>
                                        </div>
                                        <div className="border-t px-4 py-2 border-gray-200">
                                            <div className="sm:divide-y sm:divide-gray-200">
                                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                                    <h3 className="text-sm font-medium ">Lý do: {detailOrder?.products[0]?.reason}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetail;
