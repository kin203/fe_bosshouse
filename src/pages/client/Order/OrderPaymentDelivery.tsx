import { Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/products';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setReload } from '../../../redux/slices/Reload';

const OrderPaymentDelivery = () => {
    const { infoOrder } = useSelector((state: any) => state.infoOrder)
    // console.log(infoOrder)
    // Tính tổng tiền hàng
    let totalPrice = 0;
    infoOrder?.products?.forEach((item) => {
        totalPrice += item.initPriceProduct * item.selectedQuantity;
    });
    const dispatch = useDispatch();
    console.log(infoOrder)

    useEffect(() => {
        // When the component unmounts, dispatch an action to set "reload" to true
        return () => {
            dispatch(setReload(true));
        };
    }, []);
    return (
        <>
            <div className="bg-gray-100  md:p-5">
                <div className='text-center pt-8'>
                    <svg width="100%" height="5em" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#1fe564" d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m-55.808 536.384l-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"></path>
                    </svg>

                    <h1 className="text-2xl font-bold text-gray-800">Đặt hàng thành công</h1>
                    <h2 className=" text-gray-800 leading-7">Đơn hàng của bạn sẽ sớm được gửi đi</h2>
                    <h2 className=" text-gray-800">Chân thành cảm ơn bạn vì đã mua hàng tại BossHouse</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2">
                    <div className="bg-white pb-3 shadow overflow-hidden sm:rounded-lg">
                        <div className=' px-4 py-2 flex justify-between items-center'>
                            <div className="">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin đặt hàng</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-800">Họ tên người nhận: {infoOrder?.fullName}</p>
                                <p className="mt-1 max-w-2xl text-sm text-gray-800">Email: {infoOrder?.email}</p>
                                <p className="mt-1 max-w-2xl text-sm text-gray-800">Số điện thoại: 0{infoOrder?.phoneNumber}</p>
                                <p className="mt-1 max-w-2xl text-sm text-gray-800">Thời gian đặt hàng: {moment().format('DD-MM-YYYY hh:mm:ss')}</p>
                            </div>
                            {/* <Button className=" secondary max-w-2xl text-sm text-blue-500 hover:text-blue-700 ">Hóa đơn</Button> */}
                        </div>
                        <div className="border-t px-4 py-2 border-gray-200">
                            <div className="sm:divide-y sm:divide-gray-200">
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                    <h3 className="text-sm font-medium ">Phương thức thanh toán</h3>
                                    <p className="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        Thanh toán khi nhận hàng
                                    </p>
                                </div>
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                    <Link to={'/order-history'}>
                                        <button className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded'>Kiểm tra đơn hàng</button>
                                    </Link>
                                    <Link className='' to={'/'}><Button>Quay về trang chủ</Button></Link>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white pb-3  shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-4 lg:py-0!important">
                            <h3 className="text-lg leading-10 font-medium text-gray-900">Sản phẩm</h3>
                        </div>
                        <div className="border-t  border-gray-200 px-4 py-5 sm:p-0">
                            <div className="sm:divide-y sm:divide-gray-200">
                                {
                                    infoOrder?.products?.map((item, i) => {
                                        // console.log(item)
                                        return (
                                            <div key={i} className="flex items-center justify-between mb-2">
                                                <div className="flex items-center pt2">
                                                    <img src={item?.initImageProduct} alt="img" className="h-16 w-16 rounded mr-4" />
                                                    <div>
                                                        <p className="font-semibold">{item?.initNameProduct}</p>
                                                        <p className="text-gray-600 text-xs">Phân loại: {item?.selectedSize}</p>
                                                        <p className="text-gray-600 text-xs">Số lượng: {item?.selectedQuantity}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">{formatCurrency(item?.initPriceProduct)}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div>
                            <div className="total flex items-center justify-between px-4 mb-2">
                                <p className='font-semibold'>Tổng tiền hàng </p>
                                <span className='font-medium'>{formatCurrency(infoOrder?.products.reduce((a, b) => a + b.initPriceProduct * b.selectedQuantity, 0))}</span>
                            </div>
                            <div className="text-sm total flex items-center justify-between px-4 mb-2">
                                <p className='font-semibold'>Giảm giá </p>
                                <span className='font-medium'>- {formatCurrency(infoOrder?.salePrice)}</span>
                            </div>
                            <div className="text-sm flex items-center justify-between px-4 mb-2">
                                <p className='font-medium'>Phí vận chuyển </p>
                                <span className=''>{formatCurrency(infoOrder?.transportFee)}</span>
                            </div>
                            <div className="total flex items-center justify-between px-4 mb-2">
                                <p className='font-semibold'>Tổng tiền </p>
                                <span className='font-medium'>{formatCurrency(infoOrder?.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderPaymentDelivery;
