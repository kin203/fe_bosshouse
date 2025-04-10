import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { useProducts } from '../../../../hooks/apis/products';
import Loading from '../../../../components/loading/Loading';
import { formatCurrency } from '../../../../utils/products';
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { Form } from "antd";
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { RightOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { InputNumber } from 'antd';
import { addCart } from '../../../../services/cart';
import { useAddCart, useAddCartPayNow, useGetCartByUserId } from '../../../../hooks/apis/carts';
import { setCartQuantity, setRepuchaseListProductChecked } from '../../../../redux/slices/Cart';
import Aos from 'aos';
import 'aos/dist/aos.css';
import style from './button.module.css'
import { useGetSoldProductId } from '../../../../hooks/apis/soldProduct';
import { getSoldProductId } from '../../../../services/soldProduct';
import { motion } from "framer-motion";
import { setLastPriceCart, setListProductCartSelected } from '../../../../redux/slices/listProductCartSelected';
import { Box, Skeleton } from '@mui/material';
import { toast } from "react-toastify";

const MenuToday = () => {
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);

    const userSession = sessionStorage.getItem("user");
    const userId = JSON.parse(userSession)?._id;
    const { data: listCartUser } = useGetCartByUserId({ userId });


    const [current, setCurrent] = useState(1);
    const [dataModal, setDataModal] = useState(null);
    const { data, isLoading } = useProducts(current);
    const [isModalOpen, setIsModalOpen] = useState([false, false]);
    const [quantity, setQuantity] = useState(1);
    const [sizeProduct, setSizeProduct] = useState(dataModal?.sizes[0]);
    const dispatch = useDispatch()
    const [sold, setSold] = useState(0);
    const { mutateAsync } = useAddCart()

    const next = useNavigate();

    const { mutateAsync: addCartPayNow } = useAddCartPayNow()

    useEffect(() => {
        if (dataModal && dataModal?.sizes) {
            setSizeProduct(dataModal?.sizes[0]);
        }
    }, [dataModal]);

    // const { data: soldProduct } = useGetSoldProductId({ productId: dataModal?._id })
    // console.log(soldProduct)

    // useEffect(() => {
    //     (async () => {
    //         if (dataModal) { // Kiểm tra dataModal có tồn tại trước khi gọi getSoldProductId
    //             const res = await getSoldProductId({ productId: dataModal?._id });
    //             setSold(res?.data?.quantitySold);
    //         }
    //     })();
    // }, [dataModal]);

    // hàm đóng mở
    const toggleModal = (idx, target) => {
        setIsModalOpen((p) => {
            p[idx] = target;
            return [...p];
        });
    };

    // thêm vào giỏ hàng
    const handleAddToCart = async (item: any) => {
        const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
        if (!userSession) {
            Swal.fire({
                title: 'Thêm giỏ hàng không thành công!',
                text: 'Bạn cần đăng nhập để mua hàng.',
                icon: 'warning'
            }).then(() => {
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

        const itemCart = listCartUser?.data.carts?.find(i => i.product._id == dataModal?._id)
        const maxQuantity = itemCart?.product?.sizes.find(i => i.size == sizeProduct.size)

        // if(itemCart.selectedQuantity == maxQuantity.quantity){
        //     toast.error("Số lượng sản phẩm này trong giỏ hàng của bạn đã đạt tối đa!")
        //     return
        // }

        if ((itemCart?.selectedQuantity + quantity) > maxQuantity.quantity) {
            toast.error("Vượt quá số lượng tối đa của sản phẩm! ")
            return
        }

        const dataAddToCart = {
            _userId: userSession?._id,
            _id: item?._id,
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }

        mutateAsync(dataAddToCart)
    }

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

        const itemCart = listCartUser?.data.carts?.find(i => i.product._id == dataModal?._id)
        const maxQuantity = itemCart?.product?.sizes.find(i => i.size == sizeProduct.size)

        // if(itemCart.selectedQuantity == maxQuantity.quantity){
        //     toast.error("Số lượng sản phẩm này trong giỏ hàng của bạn đã đạt tối đa!")
        //     return
        // }

        if ((itemCart?.selectedQuantity + quantity) > maxQuantity.quantity) {
            toast.error("Vượt quá số lượng tối đa của sản phẩm! ")
            return
        }

        // Push checkout
        // const dataAddToCart = {
        //     _userId: userSession?._id,
        //     _id: dataModal._id,
        //     selectedSize: sizeProduct.size,
        //     selectedQuantity: quantity
        // }
        // addCartPayNow(dataAddToCart)

        // dispatch(setListProductCartSelected([
        //     {
        //         product: dataModal,
        //         selectedSize: sizeProduct.size,
        //         selectedQuantity: quantity
        //     }
        // ]));
        // dispatch(setLastPriceCart(quantity * sizeProduct.price));
        // next('/checkout')

        // Push Cart
        const dataRepuchart = {
            product: { _id: dataModal?._id, ...dataModal },
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }
        dispatch(setRepuchaseListProductChecked([dataRepuchart]))

        const dataAddToCart = {
            _userId: userSession?._id,
            _id: dataModal._id,
            selectedSize: sizeProduct.size,
            selectedQuantity: quantity
        }
        addCartPayNow(dataAddToCart)
        next('/cart')
    }

    useEffect(() => {
        if (sizeProduct?.quantity < quantity) {
            setQuantity(sizeProduct.quantity);
        }
    }, [sizeProduct?.quantity]);



    return (
        <section className="py-16 bg-[#eeede7]">
            <div data-aos='fade-up' className="text-center">
                <h2 className="font-bold xl:text-3xl text-2xl mb-4 ">BOSSHOUSE CÓ NHỮNG GÌ</h2>
                <div>
                    <img className="block mx-auto" src="/images/ngoi-sao.png" alt="" />
                </div>
            </div>
            <div data-aos='fade-up' className="xl:mx-[60px] mx-[15px] mt-16">
                {isLoading ? (<>
                    <Swiper spaceBetween={15} autoplay={{ delay: 5000, disableOnInteraction: true, }} modules={[Autoplay, Navigation]}
                        className="mySwiper"
                        centeredSlides={false}
                        pagination={{
                            type: 'custom',
                        }}
                        navigation={true}
                        virtual={false}
                        breakpoints={{
                            320: {
                                slidesPerView: 2,
                                spaceBetween: 5
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 15,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 15,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 25,
                            },
                        }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-hidden">
                            {[...Array(5)].map((item: any, index: number) => (
                                <SwiperSlide key={index} className='text-center'>
                                    <Box className="container px-0 relative">
                                        <Skeleton variant="rounded" animation="wave" height={200} />
                                        <Skeleton variant="text" width='' sx={{ fontSize: '1.5rem' }} animation="wave" />
                                        <div className="flex justify-center">
                                            <Skeleton variant="text" width='70%' sx={{ fontSize: '1.5rem' }} animation="wave" />

                                        </div>
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </div>
                    </Swiper>



                </>) : (
                    <Swiper slidesPerView={4} spaceBetween={15} autoplay={{ delay: 5000, disableOnInteraction: false, }} modules={[Pagination, Autoplay, Navigation]}
                        className="mySwiper"
                        centeredSlides={false}
                        pagination={{
                            type: 'custom',
                        }}
                        navigation={true}
                        virtual={false}
                        breakpoints={{
                            320: {
                                slidesPerView: 2,
                                spaceBetween: 5
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 0,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 15,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 25,
                            },
                        }}
                    >
                        {data?.data?.docs?.filter(i => i.isActive === true)?.map((item: any, index: number) => (
                            <SwiperSlide key={index} className='text-center'>
                                <div className="container px-0 relative">
                                    <div className=' w-full xl:h-62 h-50'>
                                        <div className="card rounded-md overflow-hidden relative group cursor-pointer hover:border-none">
                                            <Link to={`/products/detail/${item?._id}`}>
                                                <img src={item?.images[0]?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'} alt="bg"
                                                    className="w-full object-cover xl:h-[250px] h-[200px] transition-all transform group-hover:scale-100" />
                                            </Link>

                                            <div className="group-hover:bottom-0 transition-all absolute -bottom-20 left-0 text-white z-20 bg-[red] w-full">
                                                <button onClick={() => {
                                                    toggleModal(0, true)
                                                    setDataModal(item)
                                                }} className="hover:bg-blue-600 transition-all text-sm font-semibold  py-2 flex justify-center   bg-blue-500 w-full">XEM NHANH</button>
                                            </div>
                                            <div className="z-10 absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent"></div>
                                            <Link to={`/products/detail/${item?._id}`} className="absolute z-0 inset-0  opacity-0 group-hover:opacity-80 transition-all"></Link>
                                        </div>
                                    </div>

                                    <Link to={`/products/detail/${item?._id}`}><div className='font-semibold text-[18px] my-2'>{item.name?.length > 20 ? item.name.slice(0, 20) + '...' : item.name}</div></Link>
                                    <div className='text-[red] text-base font-medium'>
                                        {formatCurrency(
                                            item?.sizes?.reduce(
                                                (min, p) => (p.price < min ? p.price : min),
                                                item?.sizes[0]?.price
                                            )
                                        )}  {
                                            item?.sizes.length > 1 ? (' - ' + formatCurrency(
                                                item?.sizes?.reduce(
                                                    (max, p) => (p.price > max ? p.price : max),
                                                    item?.sizes[0]?.price
                                                )
                                            )
                                            ) : undefined
                                        }
                                        {/* {formatCurrency(item?.sizes[0]?.price)} - {formatCurrency(item?.sizes[item?.sizes?.length - 1]?.price)} */}
                                    </div>

                                    {/* Hết hàng */}
                                    {item?.sizes?.every(s => s.quantity === 0) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                                            // whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.7)" }}
                                            className="absolute top-0 left-0 text-gray-700 font-semibold px-3 py-2 text-sm bg-white rounded-br-lg"
                                            style={{ zIndex: 9999 }} // Đảm bảo chữ nổi lên trên cùng
                                        >
                                            <motion.span
                                            // animate={{ opacity: [0, 1] }} // Tạo hiệu ứng nhấp nháy
                                            // transition={{ duration: 0.5, repeat: Infinity }} // Lặp vô hạn
                                            >
                                                Hết hàng
                                            </motion.span>
                                        </motion.div>
                                    )}

                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}

                <Link to="/products" className='flex justify-center items-center active:transform active:scale-95 active:rotate-Z-1.7'>
                    <button className={style.Button}>XEM THÊM <RightOutlined className='text-base' /></button>
                </Link>
            </div>

            <Modal
                // title="Đăng nhập"
                open={isModalOpen[0]}
                onOk={() => toggleModal(0, false)}
                onCancel={() => toggleModal(0, false)}
                footer=""
                width={800}
            >
                {/* <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6 lg:px-8"> */}
                <Form autoComplete="off" >
                    <div className="md:flex md:items-center gap-5">
                        <div className="w-full h-64 md:w-1/2 lg:h-96 mt-4">
                            <Swiper slidesPerView={1}
                                spaceBetween={30}
                                loop={true}
                                pagination={{
                                    clickable: true,
                                }}
                                navigation={true}
                                modules={[Pagination, Navigation]}
                                className="mySwiper text-2xl "
                            >
                                {dataModal?.images.map((item, index) => (
                                    <SwiperSlide key={index} className='select-none'>
                                        <img
                                            alt='img'
                                            key={index}
                                            // style={{ objectFit: 'contain', height: "380px" }}
                                            // width={100} height={80}
                                            className=" w-full rounded-md object-contain max-w-lg mx-auto"
                                            src={item?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                                        />
                                    </SwiperSlide>

                                ))}
                            </Swiper>
                        </div>
                        <div className="w-full max-w-lg mx-auto xl:mt-5 mt-20 md:ml-8 md:mt-0 md:w-1/2">
                            <h1 className=" font-bold text-2xl border-b py-[14px] xl:mt-0 mt-32 leading-7 capitalize  ">{dataModal?.name}</h1>
                            <div className="product-page-accordian">
                                <div className="accordion text-lg ">
                                    <br />
                                    <div className="text-[#ee4d2d] font-medium text-[22px]">
                                        {formatCurrency(sizeProduct?.price)}
                                    </div>
                                    <div className="flex my-3 items-center text-[#757575] font-medium text-base">
                                        <span className="mr-3">Phân Loại</span>
                                        {dataModal?.sizes?.map((item, index) => (
                                            <button
                                                key={index}
                                                className={`w-20 h-8 rounded-sm mx-1 ${item?.size === sizeProduct?.size ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                                                onClick={() => {
                                                    setSizeProduct(dataModal?.sizes[index]);
                                                    setQuantity(1);
                                                }}
                                            >
                                                {item.size}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="add-to-cart-container">
                                        <div className="cart flex flex-wrap" >
                                            <div className="quantity me-4 h-full items-center whitespace-nowrap">
                                                <span className="mr-3 font-medium text-base text-[#757575]">Số Lượng</span>
                                                <InputNumber
                                                    style={{ width: "80px" }}
                                                    min={-10000000}
                                                    // max={sizeProduct?.quantity}
                                                    value={sizeProduct?.quantity === 0 ? 1 : quantity}
                                                    onChange={(value) => {
                                                        setQuantity(value);
                                                    }}
                                                // onBlur={() => {
                                                //     if (quantity < 1) {
                                                //         toast.error("Số lượng phải lớn hơn 0!")
                                                //     } else if (quantity > sizeProduct?.quantity) {
                                                //         toast("Vượt quá số lượng kho hàng!")
                                                //         setQuantity(sizeProduct.quantity)
                                                //     }
                                                // }}
                                                />
                                            </div>
                                            <span className="text-sm py-1.5 font-medium text-[#757575]">{sizeProduct?.quantity} sản phẩm có sẵn</span>
                                        </div>
                                        <div className='flex'>
                                            <button onClick={() => handleAddToCart(dataModal)} disabled={sizeProduct?.quantity === 0} type="submit" name="add-to-cart" className={`hover:bg-[#b5d4f1cc]  bg-[#e8ebff] my-3  p-2 rounded-sm text-base text-blue-600 border-[1.5px] border-[blue] max-[460px] font-semibold ${sizeProduct?.quantity === 0 ? 'cursor-not-allowed opacity-50' : ''}`}><i className="fa-solid fa-cart-shopping mr-2"></i>Thêm vào giỏ hàng</button>
                                            <button onClick={() => payNow()} disabled={sizeProduct?.quantity === 0} type="button" name="add-to-cart" className={`hover:bg-[#ee4d2dbe] bg-[#ee4d2d] xl:block hidden ml-2 my-3 px-4 p-2 rounded-sm text-base text-white border-[1.5px] border-[#ee4d2d] max-[460px] font-semibold ${sizeProduct?.quantity === 0 ? 'cursor-not-allowed opacity-50' : ''}`}>Mua Ngay</button>
                                        </div>
                                        <div className=" mt-2 text-base">Mô tả: {dataModal?.description}
                                        </div>
                                        <div className="my-2">
                                            <span className="font-medium text-base">Lưu ý</span> : <span className="font-normal">Giá sản phẩm có thể thay đổi theo từng thời điểm. </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
                {/* </div> */}
            </Modal>


        </section>
    );
};

export default MenuToday;