import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Image } from "antd";
import { formatCurrency } from "../../../../utils/products";
import { InputNumber } from 'antd';
import Swal from "sweetalert2";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { useDispatch } from "react-redux";
import { addCart } from "../../../../services/cart";
import { setCartQuantity, setRepuchaseListProductChecked } from "../../../../redux/slices/Cart";
import { useGetSoldProductId } from "../../../../hooks/apis/soldProduct";
import { setLastPriceCart, setListProductCartSelected } from "../../../../redux/slices/listProductCartSelected";
import { useAddCart, useAddCartPayNow, useGetCartByUserId } from "../../../../hooks/apis/carts";
import { toast } from "react-toastify";
import { setCodeR, setSalePriceR, setVoucherId } from "../../../../redux/slices/voucher";
import { Skeleton, Typography } from "@mui/material";

const DetailSection = ({ data, isLoading }) => {
    // console.log(data);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null)
    const [sizeProduct, setSizeProduct] = useState(data?.data?.sizes[0]);
    const dispatch = useDispatch()
    const next = useNavigate();
    const { mutateAsync } = useAddCart()
    const { mutateAsync: addCartPayNow } = useAddCartPayNow()
    const { data: soldProduct } = useGetSoldProductId({ productId: data?.data?._id })

    const userSession = sessionStorage.getItem("user");
    const userId = JSON.parse(userSession)?._id;
    const { data: listCartUser } = useGetCartByUserId({ userId });

    useEffect(() => {
        dispatch(setRepuchaseListProductChecked([]))
      }, []);

    useEffect(() => {
        if (data && data.data && data.data.sizes) {
            setSizeProduct(data.data.sizes[0]);
        }
    }, [data]);

    useEffect(() => {
        // reset voucher
        dispatch(setVoucherId(null as any));
        dispatch(setSalePriceR(null as any));
        dispatch(setCodeR(null as any));
    }, []);

    const handleThumbnailClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleAddToCart = async () => {
        const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
        if (!userSession) {
            Swal.fire({
                title: 'Bạn cần đăng nhập để mua hàng!',
                icon: 'warning'
            })
                .then(() => {
                    next('/signin')
                })
            return
        }
        if (quantity > sizeProduct?.quantity) {
            toast.warning("Vượt quá số lượng kho hàng!")
            setQuantity(sizeProduct.quantity)
            return
        }

        if (quantity <= 0) {
            toast.error("Số lượng không hợp lệ!")
            setQuantity(1)
            return
        }

        const itemCart = listCartUser?.data.carts?.find(i => i.product._id == data.data?._id)
        const maxQuantity = itemCart?.product?.sizes.find(i => i.size == sizeProduct.size)
        // console.log(itemCart)

        // if(itemCart?.selectedQuantity == maxQuantity?.quantity){
        //     toast.error("Số lượng sản phẩm này trong giỏ hàng của bạn đã đạt tối đa!")
        //     return
        // }

        if ((itemCart?.selectedQuantity + quantity) > maxQuantity?.quantity) {
            toast.error("Vượt quá số lượng tối đa của sản phẩm! ")
            return
        }

        const dataAddToCart = {
            _userId: userSession?._id,
            _id: data.data._id,
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }

        mutateAsync(dataAddToCart)
    }

    useEffect(() => {
        if (sizeProduct?.quantity < quantity) {
            setQuantity(sizeProduct.quantity);
        }
    }, [sizeProduct?.quantity]);

    const payNow = () => {
        const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
        if (!userSession) {
            Swal.fire({
                title: 'Bạn cần đăng nhập để mua hàng!',
                icon: 'warning'
            })
                .then(() => {
                    next('/signin')
                })
            return
        }
        if (quantity > sizeProduct?.quantity) {
            toast.warning("Vượt quá số lượng kho hàng!")
            setQuantity(sizeProduct.quantity)
            return
        }

        if (quantity <= 0) {
            toast.error("Số lượng không hợp lệ!")
            setQuantity(1)
            return
        }


        const itemCart = listCartUser?.data.carts?.find(i => i.product._id == data.data?._id)
        const maxQuantity = itemCart?.product?.sizes.find(i => i.size == sizeProduct.size)

        // if(itemCart?.selectedQuantity == maxQuantity?.quantity){
        //     toast.error("Số lượng sản phẩm này trong giỏ hàng của bạn đã đạt tối đa!")
        //     return
        // }

        if ((itemCart?.selectedQuantity + quantity) > maxQuantity?.quantity) {
            toast.error("Vượt quá số lượng tối đa của sản phẩm! ")
            return
        }

        // Push Checkout
        // const dataAddToCart = {
        //     _userId: userSession?._id,
        //     _id: data.data._id,
        //     selectedSize: sizeProduct.size,
        //     selectedQuantity: quantity
        // }
        // addCartPayNow(dataAddToCart)

        // dispatch(setListProductCartSelected([
        //     {
        //         product: data?.data,
        //         selectedSize: sizeProduct.size,
        //         selectedQuantity: quantity
        //     }
        // ]));
        // dispatch(setLastPriceCart(quantity * sizeProduct.price));
        // next('/checkout')

        // Push Cart
        const dataRepuchart = {
            product: { _id: data?.data?._id, ...data?.data },
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }
        dispatch(setRepuchaseListProductChecked([dataRepuchart]))

        const dataAddToCart = {
            _userId: userSession?._id,
            _id: data.data._id,
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }
        addCartPayNow(dataAddToCart)
        next('/cart')
    }

    return (
        <section className="xl:mt-14 mt-16">
            <div className=" m-auto" >
                {data?.data ? (
                    <div className="detail lg:grid grid-cols-2 gap-8  m-4">
                        {/* Images */}
                        <div className="image shadow-md p-4">
                            {isLoading ? (<>
                                <div className=" flex items-center justify-center mb-3 ">
                                    <Skeleton variant="rectangular" width={320} height={320} />
                                </div>
                                <div className="cursor-pointer list-img  py-1  xl:mx-32   rounded-[10px]" >
                                    <Skeleton variant="rounded" height={100} />
                                </div>
                            </>
                            ) : (
                                <>
                                    <div className="  flex items-center justify-center rounded-xl m-2 overflow-hidden">
                                        <Image style={{ objectFit: 'contain' }}
                                            width={320} height={320}
                                            src={selectedImage || data?.data?.images[0]?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                                            placeholder={
                                                <Image preview={false}
                                                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
                                                    width={500} />
                                            }
                                        />
                                    </div>
                                    <Swiper slidesPerView={3} modules={[Pagination, Autoplay, Navigation]}
                                        className="cursor-pointer list-img  py-1  xl:mx-32 "

                                    >
                                        {data?.data?.images.map((item, index) => (
                                            <SwiperSlide key={index} className='flex justify-center '>
                                                <img
                                                    key={index}
                                                    style={{ objectFit: 'contain' }}
                                                    className="xl:w-[100px] xl:h-[100px] w-[80px] h-[80px] hover:scale-[1.1] transition-transform ease-in-out duration-500"
                                                    src={item?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                                                    onClick={() => handleThumbnailClick(item?.response?.urls[0])}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </>
                            )}
                        </div>
                        {/* Info */}
                        <div className="info">
                            {isLoading ? (<>
                                <div className="text-[#939393] font-medium text-sm font-sans xl:block hidden">
                                    <Typography variant="h5" ><Skeleton /></Typography>
                                </div>
                                <Typography variant="h3" className="  border-b  "><Skeleton /></Typography>
                                <Skeleton variant="text" width={'20%'} />

                            </>) : (
                                <>
                                    <div className="text-[#939393] font-medium text-sm font-sans xl:block hidden">
                                        <div>
                                            <Link to="/">TRANG CHỦ</Link> / <span className="">{data?.data?.name?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <h1 className=" font-bold text-[28px] border-b py-[14px] leading-7 capitalize  ">{data?.data?.name}</h1>
                                    <h3 className="text-sm mt-1">Đã bán: {soldProduct?.data?.quantitySold || 0}</h3>

                                </>
                            )}

                            <div className="product-page-accordian">
                                <div className="accordion text-lg ">
                                    {isLoading ? (<>
                                        <Typography variant="h3" width={'40%'} className="">
                                            <Skeleton />
                                        </Typography>
                                        <Skeleton variant="text" />
                                        <Skeleton variant="text" />
                                        <Skeleton variant="text" />

                                        <Typography variant="h3" width={'50%'}><Skeleton /></Typography>

                                    </>) : (<>
                                        <div className="text-[#ee4d2d] font-medium text-[26px] leading-8 my-3">
                                            {formatCurrency(sizeProduct?.price)}
                                        </div>
                                        <div className="text-base leading-6 font-normal">
                                            {data?.data?.description}
                                        </div>
                                        <div className="flex my-3 items-center text-[#757575] font-medium text-base">
                                            <span className="mr-3">Phân Loại</span>
                                            {data?.data?.sizes?.map((item, index) => (
                                                <button
                                                    key={index}
                                                    className={`w-20 h-8 rounded-sm mx-1 ${item?.size === sizeProduct?.size ? 'bg-gradient-to-r from-gray-300 via-[#56a8eb] to-gray-300 text-white' : 'bg-gray-200 text-black'}`}
                                                    onClick={() => {
                                                        setSizeProduct(data?.data?.sizes[index]);
                                                        setQuantity(1);
                                                    }}
                                                >
                                                    {item.size}
                                                </button>
                                            ))}
                                        </div>
                                    </>)}


                                    <div className="add-to-cart-container">
                                        {isLoading ? (<></>) : (<>
                                            <div className="cart flex flex-wrap " >
                                                <div className="quantity me-4 h-full items-center whitespace-nowrap">
                                                    <span className="mr-3 font-medium text-base text-[#757575]">Số Lượng</span>
                                                    <InputNumber
                                                        min={-100000000}
                                                        // max={sizeProduct?.quantity}
                                                        value={sizeProduct?.quantity === 0 ? 1 : quantity}
                                                        onChange={(value) => {
                                                            setQuantity(value);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm py-1.5 font-medium text-[#757575]">{sizeProduct?.quantity == 0 ? <p className="text-red-500">Hết hàng</p> : `${sizeProduct?.quantity} sản phẩm có sẵn`} </span>
                                            </div>
                                            <div className="mt-2">
                                                <button onClick={handleAddToCart} type="submit" name="add-to-cart"
                                                    className={`hover:bg-[#b5d4f1cc] bg-[#e8ebff] my-3 p-2 rounded-sm text-base text-blue-600 border-[1.5px] border-[blue] max-[460px] font-semibold ${sizeProduct?.quantity === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    disabled={sizeProduct?.quantity === 0}  >
                                                    <i className="fa-solid fa-cart-shopping mr-2"></i>Thêm vào giỏ hàng
                                                </button>

                                                <button onClick={payNow} type="submit" name="add-to-cart"
                                                    className={`hover:bg-[#ee4d2dbe] bg-[#ee4d2d] xl:ml-3 ml-2 my-3 px-4 p-2 rounded-sm text-base text-white border-[1.5px] border-[#ee4d2d] max-[460px] font-semibold ${sizeProduct?.quantity === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    disabled={sizeProduct?.quantity === 0}  >
                                                    Mua Ngay
                                                </button>

                                            </div>
                                            <div>
                                                <div className="my-2 border-[1px] border-black xl:w-[470px] xl:h-[80px] p-3 rounded">
                                                    <p className="xl:text-base text-[15px] leading-5">Đặt mua: <span className="font-medium text-[blue]">0366.292.585</span> - Thứ 2 - Chủ Nhật từ <strong>8:00 – 22:00</strong></p>
                                                    <p className="xl:text-base text-[15px] leading-6">Địa chỉ: Số 39 Đức Diễn, Phúc Diễn, Bắc Từ Liêm, Hà Nội.</p>
                                                </div>

                                                <div className="mt-6 flex xl:gap-8 ">
                                                    <div className="flex text-base mr-3 ">
                                                        <p><i className="fa-solid fa-repeat text-sm text-[#d0011b]"></i></p>
                                                        <span className="ml-2 ">Đổi ý miễn phí 15 ngày</span>
                                                    </div>
                                                    <div className="flex text-base">
                                                        <p><i className="fa-solid fa-check text-sm text-[#d0011b]"></i></p>
                                                        <span className="ml-2">Hàng chính hãng 100%</span>
                                                    </div>
                                                </div>
                                                <div className="my-2">
                                                    <p><span className="font-medium text-lg">Lưu ý</span> : <span className="font-normal text-base">Giá sản phẩm có thể thay đổi theo từng thời điểm. </span></p>
                                                </div>
                                            </div>
                                        </>)}

                                    </div>
                                    {/* liên hệ trực tiếp */}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className=" xl:min-h-[60vh] min-h-[40vh] text-center ">
                        <img className="xl:w-[20%] w-[30%] mx-auto" src="https://vanhoaungxudep.vn/Content/images/empty-cart.png" alt="Giỏ hàng trống" />
                        <div>Sản phẩm không tồn tại!</div>
                    </div>
                )}

            </div >
        </section >
    )
}

export default DetailSection