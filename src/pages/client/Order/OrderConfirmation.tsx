import { Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/products';
import moment from 'moment';
import { useEffect } from 'react';
import { updateOrder } from '../../../services/order';
import { updateManyQuantity } from '../../../services/products';
import { useGetCartByUserId, useUpdateCartByUserId } from '../../../hooks/apis/carts';
import { updateCartByUserId } from '../../../services/cart';
import { useDispatch, useSelector } from 'react-redux';
import { setCartQuantity } from '../../../redux/slices/Cart'
import { addNotification } from '../../../services/notification';
import { useAddOrder, useDeleteOrder } from '../../../hooks/apis/order';
import { setOrderInfo } from '../../../redux/slices/order';
import { useUpdateApplyVoucher } from '../../../hooks/apis/voucher';
import { setReload } from '../../../redux/slices/Reload';

const OrderConfirmation = () => {
    const location = useLocation();
    const dispatch = useDispatch()
    const next = useNavigate()
    const searchParams = new URLSearchParams(location.search);
    const { mutateAsync: useUpdateCart } = useUpdateCartByUserId()


    const userSession = sessionStorage.getItem("user");
    const user = JSON.parse(userSession);
    const { data } = useGetCartByUserId({ userId: user?._id })

    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_BankCode = searchParams.get('vnp_BankCode');
    const vnp_BankTranNo = searchParams.get('vnp_BankTranNo');
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    // const vnp_BankTranNo = searchParams.get('vnp_BankTranNo');

    const infoAddOrderLocal = localStorage.getItem("infoAddOrder") ? JSON.parse(localStorage.getItem("infoAddOrder")) : undefined
    console.log(infoAddOrderLocal)

    const { mutateAsync: updateApplyVoucher } = useUpdateApplyVoucher()

    const { mutateAsync } = useDeleteOrder()
    const idO = localStorage.getItem('idOrder')

    useEffect(() => {
        if (idO && vnp_ResponseCode != '00') {
            mutateAsync({ orderId: '#' + idO })
            localStorage.removeItem('idOrder')
        }
    }, []);

    useEffect(() => {
        if (vnp_ResponseCode == '00') {
            const updateStatusOrder = async () => {
                await updateOrder({
                    // orderId: vnp_TxnRef,
                    orderId: infoAddOrderLocal?._id,
                    status: "Chờ Xác Nhận Thanh Toán"
                })

                const newA = infoAddOrderLocal?.products?.map(item => {
                    // console.log(item)
                    return {
                        product: { _id: item?.productId },
                        selectedSize: item?.selectedSize,
                        selectedQuantity: item?.selectedQuantity
                    }
                })

                if (idO && vnp_TxnRef == idO) {
                    // Cập nhật lại quantity còn lại trong kho
                    const res = await updateManyQuantity(newA)
                    // console.log(res)
                    localStorage.removeItem('idOrder')
                }
            }
            updateStatusOrder()


            // Xóa cart khi thanh toán
            const productsInAOnly = data?.data?.carts.filter((itemA) => {
                // Kiểm tra xem có phần tử nào trong listProductCartSelected có productId trùng với itemA không
                // Nếu không tìm thấy, trả về true (giữ lại itemA)
                return !infoAddOrderLocal?.products?.some(
                    (itemB) => itemB?.product?._id == itemA?.product?._id && itemB.selectedSize == itemA.selectedSize
                );
            });
            useUpdateCart({
                userId: user?._id, carts: productsInAOnly?.map(item => {
                    return {
                        _id: item?.product?._id,
                        selectedSize: item?.selectedSize,
                        selectedQuantity: item?.selectedQuantity
                    }
                })
            });

            (async () => {
                // Cập nhật lại số sản phẩm còn lại trong giỏ hàng
                // await updateCartByUserId({ userId: user._id, carts: productsInAOnly });

                if (infoAddOrderLocal?.voucherId) {
                    // Cập nhật trạng thái voucher của người dùng
                    updateApplyVoucher({ userId: user._id, voucherId: infoAddOrderLocal?.voucherId });
                    // console.log(res)
                }

                // Thông báo tới admin
                await addNotification({
                    to: "admin",
                    username: user?.username,
                    userId: user?._id,
                    title: `${user?.username} đã xác nhận thanh toán, mã đơn hàng ${infoAddOrderLocal?._id}`,
                    content: `Đơn hàng được thanh toán vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
                })
            })()

            // Update lại số lượng sp trong giỏ hàng
            dispatch(setCartQuantity(productsInAOnly?.length))
        }
    }, [vnp_ResponseCode, vnp_TxnRef])

    let totalPrice = 0;
    infoAddOrderLocal?.listProductCartSelected?.forEach((item) => {
        const productPrice = item?.product?.sizes?.find(s => s.size == item?.selectedSize)?.price;
        totalPrice += productPrice * item?.selectedQuantity;
    });
    //set reload khi người dùng rời trang 
    useEffect(() => {
        // When the component unmounts, dispatch an action to set "reload" to true
        return () => {
            dispatch(setReload(true));
        };
    }, []);

    return (
        <>
            {
                vnp_ResponseCode == '00' ?
                    <div className="bg-gray-100  md:p-5">
                        <div className='text-center pt-8'>
                            <svg width="100%" height="5em" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#1fe564" d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m-55.808 536.384l-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"></path>
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-800">Thanh toán thành công</h1>
                            <h2 className=" text-gray-800 leading-7">Đơn hàng của bạn sẽ sớm được gửi đi</h2>
                            <h2 className=" text-gray-800">Chân thành cảm ơn bạn vì đã mua hàng tại BossHouse</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2">
                            <div className="bg-white pb-3 shadow overflow-hidden sm:rounded-lg">
                                <div className=' px-4 py-2 flex justify-between items-center'>
                                    <div className="">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin đặt hàng</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Mã đơn hàng: {vnp_OrderInfo}</p>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Mã thanh toán: {vnp_BankTranNo}</p>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-800">Thời gian: {moment().format('DD-MM-YYYY hh:mm:ss')}</p>
                                    </div>
                                    {/* <Button className=" secondary max-w-2xl text-sm text-blue-500 hover:text-blue-700 ">Hóa đơn</Button> */}
                                </div>
                                <div className="border-t px-4 py-2  h-full  border-gray-200">
                                    <div className="sm:divide-y h-full sm:divide-gray-200">
                                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                            <p className="text-sm font-medium ">Người nhận</p>
                                            <p className=" text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{infoAddOrderLocal?.fullName}<br />{infoAddOrderLocal?.address}<br /> {infoAddOrderLocal?.phoneNumber}</p>
                                        </div>
                                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
                                            <h3 className="text-sm font-medium ">Phương thức thanh toán</h3>
                                            <p className="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                VNPay - Ngân hàng: {vnp_BankCode}
                                            </p>
                                        </div>
                                        <div className="py-2 flex gap-2">
                                            <Link to={'/order-history'}>
                                                <button className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 flex items-end rounded'>Kiểm tra đơn hàng</button>
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
                                            infoAddOrderLocal?.listProductCartSelected?.map((item, i) => {
                                                // console.log(item)
                                                return (
                                                    <div key={i} className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center pt2">
                                                            <img src={item?.product?.images[0].response.urls[0]} alt="img" className="h-16 w-16 rounded mr-4" />
                                                            <div>
                                                                <p className="font-semibold">{item?.name}</p>
                                                                <p className="text-gray-600 text-xs">Phân loại: {item?.selectedSize}g</p>
                                                                <p className="text-gray-600 text-xs">Số lượng: {item?.selectedQuantity}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">{formatCurrency(item?.product?.sizes?.find(s => s.size == item?.selectedSize)?.price)}</span>
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
                                        <span className='font-medium'>{formatCurrency(infoAddOrderLocal?.products?.reduce((a, b) => a += b.initPriceProduct * b.selectedQuantity, 0))}</span>
                                    </div>
                                    <div className="text-sm total flex items-center justify-between px-4 mb-2">
                                        <p className='font-semibold'>Giảm giá </p>
                                        <span className='font-medium'>- {formatCurrency(infoAddOrderLocal?.salePrice)}</span>
                                    </div>
                                    <div className="text-sm flex items-center justify-between px-4 mb-2">
                                        <p className='font-medium'>Phí vận chuyển </p>
                                        <span className=''>{formatCurrency(infoAddOrderLocal?.transportFee)}</span>
                                    </div>
                                    <div className="total flex items-center justify-between px-4 mb-2">
                                        <p className='font-semibold'>Tổng tiền </p>
                                        <span className='font-medium'>{formatCurrency(Number(vnp_Amount) / 100)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    :

                    <div className="bg-gray-100  md:p-5">
                        <div className='text-center pt-8 h-[64vh]'>
                            <div className='flex justify-center py-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                                    <linearGradient id="wRKXFJsqHCxLE9yyOYHkza_fYgQxDaH069W_gr1" x1="9.858" x2="38.142" y1="9.858" y2="38.142" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f44f5a"></stop><stop offset=".443" stop-color="#ee3d4a"></stop><stop offset="1" stop-color="#e52030"></stop></linearGradient><path fill="url(#wRKXFJsqHCxLE9yyOYHkza_fYgQxDaH069W_gr1)" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path d="M33.192,28.95L28.243,24l4.95-4.95c0.781-0.781,0.781-2.047,0-2.828l-1.414-1.414	c-0.781-0.781-2.047-0.781-2.828,0L24,19.757l-4.95-4.95c-0.781-0.781-2.047-0.781-2.828,0l-1.414,1.414	c-0.781,0.781-0.781,2.047,0,2.828l4.95,4.95l-4.95,4.95c-0.781,0.781-0.781,2.047,0,2.828l1.414,1.414	c0.781,0.781,2.047,0.781,2.828,0l4.95-4.95l4.95,4.95c0.781,0.781,2.047,0.781,2.828,0l1.414-1.414	C33.973,30.997,33.973,29.731,33.192,28.95z" opacity=".05"></path><path d="M32.839,29.303L27.536,24l5.303-5.303c0.586-0.586,0.586-1.536,0-2.121l-1.414-1.414	c-0.586-0.586-1.536-0.586-2.121,0L24,20.464l-5.303-5.303c-0.586-0.586-1.536-0.586-2.121,0l-1.414,1.414	c-0.586,0.586-0.586,1.536,0,2.121L20.464,24l-5.303,5.303c-0.586,0.586-0.586,1.536,0,2.121l1.414,1.414	c0.586,0.586,1.536,0.586,2.121,0L24,27.536l5.303,5.303c0.586,0.586,1.536,0.586,2.121,0l1.414-1.414	C33.425,30.839,33.425,29.889,32.839,29.303z" opacity=".07"></path><path fill="#fff" d="M31.071,15.515l1.414,1.414c0.391,0.391,0.391,1.024,0,1.414L18.343,32.485	c-0.391,0.391-1.024,0.391-1.414,0l-1.414-1.414c-0.391-0.391-0.391-1.024,0-1.414l14.142-14.142	C30.047,15.124,30.681,15.124,31.071,15.515z"></path><path fill="#fff" d="M32.485,31.071l-1.414,1.414c-0.391,0.391-1.024,0.391-1.414,0L15.515,18.343	c-0.391-0.391-0.391-1.024,0-1.414l1.414-1.414c0.391-0.391,1.024-0.391,1.414,0l14.142,14.142	C32.876,30.047,32.876,30.681,32.485,31.071z"></path>
                                </svg>                            </div>

                            <h1 className="text-2xl font-bold text-gray-800">Thanh toán thất bại</h1>
                            <h2 className=" text-gray-800 leading-7">Đơn hàng của bạn đã được hủy bỏ</h2>
                            <h2 className=" text-gray-800">Cảm ơn bạn vì đã quan tâm tới sản phẩm của chúng tôi</h2>
                            <Button className='mt-4' type='primary' onClick={() => next('/')}>Quay về trang chủ</Button>
                        </div>
                    </div>
            }


        </>
    );
};

export default OrderConfirmation;
