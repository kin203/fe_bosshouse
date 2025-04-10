import React, { useState, useEffect } from 'react';
import { useGetRefundHistory } from '../../../hooks/apis/refundHistory.ts';
import { formatCurrency } from '../../../utils/products';
import { useDispatch } from 'react-redux';
import { setReload } from '../../../redux/slices/Reload.ts';

const ConfirmRefundOrder = () => {
    const [confirmationHistory, setConfirmationHistory] = useState([]);

    const { data } = useGetRefundHistory()
    // console.log(data?.data)

    useEffect(() => {
        setConfirmationHistory(data?.data);
    }, [data]);

    const dispatch = useDispatch();

    useEffect(() => {
        // When the component unmounts, dispatch an action to set "reload" to true
        return () => {
            dispatch(setReload(true));
        };
    }, []);
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Lịch sử xác nhận đơn hàng trả hàng</h2>
            <ul className="divide-y divide-gray-200">
                {confirmationHistory?.map((record, index) => (
                    <li key={index} className="py-6 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <p className="">Mã đơn hàng: {record?.orderId}</p>
                                <p className="">Giá trị đơn hàng: {formatCurrency(record?.amount)}</p>
                                <p className="">Mã nhân viên xác nhận: {record?.userId}</p>
                                <p className="">Tên nhân viên: {record?.user?.username}</p>
                                <p className="">Email: {record?.user?.email}</p>
                                <p className="">Thời gian xác nhận: {new Date(record?.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConfirmRefundOrder;
