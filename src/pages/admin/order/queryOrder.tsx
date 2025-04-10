import React, { useEffect, useState } from 'react';
import { vnPayQuery } from '../../../services/vnpay';
import { getOrder, getOrderByOrderCode } from '../../../services/order';
import { formatCurrency } from '../../../utils/products';
import moment from 'moment';
import { formatDateString } from './formatDateString';

const QueryOrder = () => {
    const [isLoading, setLoading] = useState(false);
    const [orderCode, setOrderCode] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [message, setMessage] = useState('');
    const [orderProduct, setOrderProduct] = useState(null)

    useEffect(() => {
        (async () => {
            setLoading(true)
            const res = await getOrderByOrderCode({orderCode: '#' + orderCode});
            console.log(res.data)
            setOrderProduct(res.data)
            
        })()
        setLoading(false)
    }, [orderData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const res = await vnPayQuery({ orderId: orderCode });
            console.log(res)

            if (res.data.vnp_ResponseCode == '00') {
                setOrderData(res.data);
                setMessage('');
            } else {
                setMessage('Không tìm thấy dữ liệu cho mã đơn hàng này.');
                setOrderData(null);
            }
            setLoading(false)
        } catch (error) {
            console.log(error);
            setMessage('Đã xảy ra lỗi khi truy vấn dữ liệu.');
            setLoading(false)
        }
    };
    // console.log(orderData)
    // console.log(orderProduct)

    return (
        <div className="w-[700px] pt-[50px] mx-auto min-h-[80vh]">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderCode">
                        Mã đơn hàng:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="orderCode"
                        type="text"
                        placeholder="Nhập mã đơn hàng"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-center">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        {isLoading ? 'Đang xuất liên kết...' : 'Truy vấn'}
                    </button>
                </div>
            </form>

            {orderData && orderData?.vnp_TransactionStatus == '00' && (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="text-gray-700 font-bold mb-4">Chi tiết đơn hàng:</div>
                    <div className="mb-4">
                        <p><span className="font-bold">Mã đơn hàng: </span> {orderProduct?._id}</p>
                        <p><span className="font-bold">Mã Khách hàng: </span> {orderProduct?.userId}</p>
                        <p><span className="font-bold">Tên Khách hàng: </span> {orderProduct?.fullName}</p>
                        <p><span className="font-bold">Email: </span> {orderProduct?.email}</p>
                        <p><span className="font-bold">Tổng số tiền: </span> {formatCurrency(orderData?.vnp_Amount / 100)}</p>
                        <p><span className="font-bold">Trạng thái: </span> {orderData?.vnp_TransactionStatus == '00' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</p>
                        <p><span className="font-bold">Thời gian thanh toán: </span> {orderData?.vnp_TransactionStatus == '00' ? formatDateString(orderData?.vnp_PayDate) : 'Không xác định'}</p>
                        <p><span className="font-bold">Ngân Hàng: </span> {orderData?.vnp_TransactionStatus == '00' ? orderData?.vnp_BankCode : 'Không xác định'}</p>
                    </div>
                    <div className="text-gray-700 font-bold mb-2">Sản phẩm trong đơn hàng:</div>
                    <ul>
                        {orderProduct?.products?.map((item, i) => (
                            <li key={i} className="mb-2">
                                <span className="font-bold">{item?.initNameProduct}</span> - Số lượng: {item?.selectedQuantity} - Size: {item?.selectedSize} - Giá: {formatCurrency(item?.initPriceProduct)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {message && <p className="text-red-500">{message}</p>}
        </div>
    );
};

export default QueryOrder;
