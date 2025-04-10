import { Link, useNavigate } from "react-router-dom";
import { calculatePrices, formatCurrency } from "../../../utils/products";
import { InputNumber, Modal } from "antd";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { applyVoucherAPI, getVoucherByUserId } from "../../../services/voucher";
import { useDispatch, useSelector } from "react-redux";
import {
    setListProductCartSelected,
    setLastPriceCart,
} from "../../../redux/slices/listProductCartSelected";
import { deleteCart, updateCartByUserId } from "../../../services/cart";
import { useGetCartByUserId, useUpdateCartByUserId } from "../../../hooks/apis/carts";
import { setCartQuantity, setRepuchaseListProductChecked } from "../../../redux/slices/Cart";
import { useGetVoucherByUserId, useGetVouchers } from "../../../hooks/apis/voucher";
import moment from "moment";
import { setVoucherId, setSalePriceR, setCodeR } from "../../../redux/slices/voucher";
import { getProduct } from "../../../services/products";
import { useDebounce } from "../../../utils/debouce";
import { toast } from "react-toastify";
import { useDeleteOrder } from "../../../hooks/apis/order";

const Cart = () => {
    const next = useNavigate();
    const dispatch = useDispatch();
    const userSession = sessionStorage.getItem("user");
    const userId = JSON.parse(userSession)?._id;
    const [listProductChecked, setListProductChecked] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [userVoucher, setUserVoucher] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [salePrice, setSalePrice] = useState(0)

    const { mutateAsync: useUpdateCart } = useUpdateCartByUserId()
    const { data } = useGetCartByUserId({ userId });
    const { RepuchaseListProductChecked } = useSelector((state: any) => state.cart)
    // console.log(RepuchaseListProductChecked)

    const [listCart, setListCart] = useState(null);

    useEffect(() => {
        document.title = "Giỏ hàng";
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (data) {
            setListCart(data?.data?.carts);
        }
    }, [data]);

    const { data: userVoucher1 } = useGetVoucherByUserId({ userId: userId })
    useEffect(() => {
        setUserVoucher(userVoucher1?.data?.codes);
    }, [userVoucher1?.data?.codes]);

    const handleDelete = async (index: number, id, size) => {
        // Tạo một bản sao của mảng listCart mà không bao gồm phần tử đã chọn để xóa
        const updatedListCart = listCart?.filter((item, idx) => idx !== index);

        setListProductChecked(pre => pre.filter((item, idx) => item.product._id !== id || item.selectedSize !== size))

        dispatch(setRepuchaseListProductChecked(listProductChecked.filter((item, idx) => item.product._id !== id || item.selectedSize !== size)))

        // Cập nhật state listCart
        setListCart(updatedListCart);

        const res = await deleteCart({ userId: userId, _id: id });
        dispatch(setCartQuantity(res?.data?.length));
    };

    const handleDeleteAllCart = async () => {
        Swal.fire({
            title: "Xác nhận xóa toàn bộ giỏ hàng?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Không",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await updateCartByUserId({ userId: userId, carts: [] });
                    setListCart([]);

                    Swal.fire({
                        title: "Xóa thành công!",
                        icon: "success",
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

    const onCheckedProduct = (product) => {
        // console.log(product)
        setListProductChecked((prevList) => {
            const isChecked = prevList?.some(
                (item) =>
                    item?.product._id === product?.product?._id &&
                    item?.selectedSize === product?.selectedSize
            );
            if (isChecked) {
                // Nếu sản phẩm đã được chọn, loại bỏ nó khỏi danh sách
                const newList = prevList?.filter(
                    (item) =>
                        !(
                            item?.product?._id === product?.product?._id &&
                            item?.selectedSize === product?.selectedSize
                        )
                );
                return newList;
            } else {
                // Nếu sản phẩm chưa được chọn, thêm nó vào danh sách
                const newList = [...prevList, product];
                return newList;
            }
        });
    };

    const onChangeQ = async (value: number, index: number, item) => {
        const updatedListCart = listCart.map((cartItem, idx) =>
            idx == index
                ? { ...cartItem, selectedQuantity: value }
                : cartItem
        );
        setListCart(updatedListCart);

        const updatedListProductChecked = listProductChecked.map((product) => {
            if (
                product?.product?._id == item?.product?._id &&
                product.selectedSize == item?.selectedSize
            ) {
                return {
                    ...product,
                    selectedQuantity: value
                };
            }
            return product;
        });
        setListProductChecked(updatedListProductChecked);

        // Giá tối đa cho mỗi item
        const max = item.product.sizes.find((size) => size.size === item.selectedSize)?.quantity;
        if (value >= max) {
            const updatedListCart = listCart.map((cartItem, idx) =>
                idx == index
                    ? { ...cartItem, selectedQuantity: max }
                    : cartItem
            );
            setListCart(updatedListCart);

            const updatedListProductChecked = listProductChecked.map((product) => {
                if (
                    product?.product?._id == item?.product?._id &&
                    product.selectedSize == item?.selectedSize
                ) {
                    return {
                        ...product,
                        selectedQuantity: max
                    };
                }
                return product;
            });
            setListProductChecked(updatedListProductChecked);

            toast.error("Số lượng sản phẩm đã vượt quá số lượng tối đa");
        } else {
            toast.success("Đã cập nhật số lượng sản phẩm.");
        }
    };

    // Debounce 1s khi khách hàng thay đổi quantity
    const dbListCart = useDebounce(listCart, 1000);
    useEffect(() => {
        (async () => {
            if (listCart && dbListCart) {
                const oldCart = listCart.map((item) => {
                    return {
                        _id: item.product._id,
                        selectedQuantity: item.selectedQuantity,
                        selectedSize: item.selectedSize
                    }
                })
                useUpdateCart({ userId, carts: oldCart });
            }
        })()
    }, [dbListCart]);

    useEffect(() => {
        // Tính tổng giá tiền
        const { totalPrice } = calculatePrices(listProductChecked);
        setTotalPrice(totalPrice - salePrice);

        // dispatch sản phẩm đã chọn để mua lên redux
        dispatch(setListProductCartSelected(listProductChecked));
        // dispatch(setLastPriceCart(totalPrice - salePrice));
        dispatch(setLastPriceCart(totalPrice));
    }, [listProductChecked, salePrice]);

    useEffect(() => {
        // reset voucher
        dispatch(setVoucherId(null as any));
        dispatch(setSalePriceR(null as any));
        dispatch(setCodeR(null as any));
    }, []);

    const [voucherApplied, setVoucherApplied] = useState(false);
    const applyVoucher = async () => {
        // Kiểm tra nếu voucher đã được áp dụng
        if (voucherApplied) {
            Swal.fire({
                title: "Voucher đã được áp dụng.",
                icon: "warning",
            });
            return;
        }

        // Kiểm tra nếu chưa chọn voucher
        if (selectedVoucher?.apply) {
            Swal.fire({
                title: "Voucher này bạn đã sử dụng rồi.",
                icon: "warning",
            });
            return;
        }

        // Kiểm tra nếu chưa chọn voucher
        if (!selectedVoucher) {
            Swal.fire({
                title: "Vui lòng chọn 1 mã giảm giá.",
                icon: "warning",
            });
            return;
        }

        // Kiểm tra nếu chưa chọn sản phẩm
        if (listProductChecked.length === 0) {
            Swal.fire({
                title: "Cần chọn tối thiểu 1 sản phẩm!",
                icon: "warning",
            });
            return;
        }

        try {
            // Kiểm tra xem voucher có hết hạn hay không
            if (moment(new Date()) < moment(selectedVoucher?.expirationDate[0])) {
                Swal.fire({
                    title: "Chưa diễn ra!",
                    icon: "warning",
                });
                return;
            }

            if (moment(new Date()) > moment(selectedVoucher?.expirationDate[1])) {
                Swal.fire({
                    title: "Voucher đã hết hạn!",
                    icon: "warning",
                });
                return;
            }

            // Tính toán giá giảm và cập nhật tổng giá và giá giảm
            const discount = selectedVoucher.discountPercent || 0;
            let salePrice = (totalPrice * discount) / 100;
            if (salePrice > selectedVoucher?.maxDiscount) {
                salePrice = selectedVoucher?.maxDiscount;
            }
            setTotalPrice(pre => pre - salePrice);
            setSalePrice(salePrice);

            Swal.fire({
                title: "Áp dụng voucher thành công!",
                icon: "success",
            })

            toggleModal(0, false);

            // dispatch voucherId lên redux
            dispatch(setVoucherId(selectedVoucher._id));
            dispatch(setSalePriceR(salePrice as any));
            dispatch(setCodeR(selectedVoucher?.code));

            // Đánh dấu rằng voucher đã được áp dụng
            setVoucherApplied(true);
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Áp dụng không thành công!",
                text: error?.response?.data?.error,
                icon: "warning",
            });
        }
    };

    const handleNavigateCheckOut = async () => {
        if (totalPrice == 0) {
            Swal.fire({
                title: "Checkout không thành công!",
                text: "Bạn cần chọn tối thiểu 1 đơn hàng.",
                icon: "warning",
            });
        } else {
            next("/checkout");
        }
    };

    const calculateTotalQuantity = (products) => {
        // Tính tổng số lượng sản phẩm đã chọn
        const totalQuantity = products?.reduce(
            (total, product) => total + product?.selectedQuantity,
            0
        );
        return totalQuantity;
    };

    // check all
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const handleSelectAll = () => {
        setSelectAllChecked(!selectAllChecked);
        // Cập nhật listProductChecked dựa trên selectAllChecked
        if (!selectAllChecked) {
            // Nếu chưa được chọn tất cả, chọn tất cả các sản phẩm có sẵn
            setListProductChecked(listCart.filter(item => item.product && item.product.sizes.some(s => s.quantity > 0)));
        } else {
            // Nếu đã được chọn tất cả, xóa tất cả các sản phẩm đã chọn
            setListProductChecked([]);
        }
    };

    // đếm tổng sản phẩm
    const [cartCount, setCartCount] = useState(0);
    useEffect(() => {
        // Kiểm tra xem listCart đã được định nghĩa trước khi sử dụng
        if (listCart) {
            // Đếm tổng số đơn hàng trong giỏ hàng (loại bỏ các đơn hàng có sản phẩm là null)
            const totalOrders = listCart.reduce((total, item) => {
                // Kiểm tra nếu sản phẩm không null thì mới cộng vào tổng số đơn hàng
                if (item.product !== null) {
                    return total + 1;
                }
                return total;
            }, 0);
            setCartCount(totalOrders);
        }
    }, [listCart]);



    // đến số sản phẩm khi click vào checkbox
    const [selectedProductCount, setSelectedProductCount] = useState(0);
    //cập nhật số lượng sản phẩm đã chọn
    useEffect(() => {
        setSelectedProductCount(listProductChecked.length);
    }, [listProductChecked]);

    // hàm đóng mở
    const [isModalOpen, setIsModalOpen] = useState([false, false]);
    const toggleModal = (idx, target) => {
        setIsModalOpen((p) => {
            p[idx] = target;
            return [...p];
        });
    };

    // CHọn lại size
    const [isModalChooseSize, setIsModalChooseSize] = useState(false)
    const [itemChooseSize, setItemChooseSize] = useState(null)
    const [selectSize, setSelectSize] = useState(null)
    const [selectQuantity, setSelectQuantity] = useState(1)
    const [indexCart, setIndexCart] = useState(0)

    const handleOk = () => {
        // setIsModalChooseSize(false);

        // // console.log(itemChooseSize)
        // // console.log(selectSize?.size)
        // // console.log(selectQuantity)
        // // console.log(indexCart)
        // listCart[indexCart].selectedSize = selectSize?.size
        // listCart[indexCart].selectedQuantity = selectQuantity
        // setListCart([...listCart])

        setIsModalChooseSize(false);

        // Tạo một bản sao của đối tượng listCart[indexCart]
        const updatedItem = { ...listCart[indexCart] };

        // Thay đổi thuộc tính của bản sao
        updatedItem.selectedSize = selectSize?.size;
        updatedItem.selectedQuantity = selectQuantity;

        // Cập nhật lại mảng listCart với bản sao đã thay đổi
        const updatedListCart = [...listCart];
        updatedListCart[indexCart] = updatedItem;
        setListCart(updatedListCart);
        dispatch(setRepuchaseListProductChecked([]))
    };

    const handleCancel = () => {
        setIsModalChooseSize(false);
    };


    useEffect(() => {
        if (RepuchaseListProductChecked && listCart) {
            const mapB = {};
            listCart?.forEach(item => {
                const key = `${item?.product?._id}-${item.selectedSize}`;
                mapB[key] = item;
            });

            const newArrayA = RepuchaseListProductChecked?.map(itemA => {
                const key = `${itemA?.product?._id}-${itemA?.selectedSize}`;
                if (mapB.hasOwnProperty(key)) {
                    return mapB[key];
                } else {
                    return itemA;
                }
            });
            // console.log(newArrayA);

            setListProductChecked(newArrayA)

        }
    }, [RepuchaseListProductChecked, listCart]);
    // const reload = useSelector((state: { reload: any }) => state.reload);
    // useEffect(() => {
    //     // When the component mounts, check if "reload" is true
    //     // If it is, set it to false and reload the page
    //     if (reload) {
    //         dispatch(setReload(false));
    //         window.location.reload();
    //     }
    // }, [reload]);
    // console.log(RepuchaseListProductChecked)
    // console.log(listProductChecked)
    // console.log(listCart)

    console.log(itemChooseSize);
    
    return (
        <>
            {
                listCart?.length > 0 ? (
                    <div className="h-auto pb-20 xl:mt-8 mt-16 bg-white">
                        <div className="flex mx-auto max-w-7xl pb-8">
                            <h1 className="xl:text-3xl text-2xl font-bold mx-auto">Giỏ Hàng</h1>
                        </div>
                        <div className="mx-auto max-w-7xl px-1 justify-center ">
                            <div className="">
                                <nav className="text-xs bg-neutral-50 py-2 p-1 font-semibold uppercase border">
                                    <ul className="flex  font-medium text-base text-center">
                                        <li className=" w-[10%]  text-sm ">
                                            #
                                        </li>
                                        <li className=" w-[60%] text-left ">
                                            Sản Phẩm
                                        </li>
                                        <li className=" w-[40%] xl:block hidden ">
                                            Số Lượng
                                        </li>
                                        <li className=" w-[40%] xl:block hidden ">
                                        Phân Loại
                                        </li>
                                        <li className=" w-[40%] xl:block hidden ">
                                            Tổng Tiền
                                        </li>
                                        <li className=" xl:w-[20%] w-[30%]">

                                        </li>
                                    </ul>
                                </nav>
                                <div className="my-3">
                                    {
                                        listCart?.map((item, i: number) => {
                                            // console.log(item)
                                            return (
                                                <div onClick={() => {
                                                    if (item?.product?.sizes.find(s => s?.size == item?.selectedSize && s.quantity >= item.selectedQuantity) && item?.product?.sizes.some(s => s.quantity > 0) && item?.product != null) {
                                                        onCheckedProduct(item)
                                                    }
                                                }} key={i} className={`relative select-none ${item?.product?.sizes.find(s => s.size == item?.selectedSize) ? 'bg-neutral-50' : 'bg-gray-400'} bg-neutral-50 mt-2 cursor-pointer flex  text-center p-1 hover:bg-slate-100`}>
                                                    <div className="py-4 w-[10%] ">
                                                        <input
                                                            type="checkbox"
                                                            className=" cursor-pointer"
                                                            value={item?.product?._id}
                                                            checked={listProductChecked?.some((product) => product?.selectedSize == item?.selectedSize && item?.product?._id == product?.product?._id)}
                                                            onChange={() => {
                                                                if (item?.product?.sizes.find(s => s?.size == item?.selectedSize && s.quantity >= item.selectedQuantity) && item?.product?.sizes.some(s => s.quantity > 0) && item?.product != null) {
                                                                    onCheckedProduct(item)
                                                                }
                                                                // onCheckedProduct(item)
                                                            }}
                                                        />
                                                    </div>

                                                    <div className=" xl:w-[60%] w-full flex  xl:text-base text-sm">
                                                        {item && item.product && item.product.images && item.product.images.length > 0 ? (
                                                            <img src={item.product.images[0].response.urls[0]} alt="img" className="xl:w-[28%] xl:h-[100%] w-20" />
                                                        ) : (
                                                            <img src='https://thcsgiangvo-hn.edu.vn/wp-content/uploads/2023/09/anh-loading-1.jpg' alt="default-img" className="xl:w-[28%] xl:h-[100%] w-20" />
                                                        )}

                                                        <span className="ml-2 py-4 xl:block hidden">
                                                            {item?.product?.name}
                                                        </span>
                                                        <div className="flex  justify-between  w-full xl:hidden">
                                                            <div className=" w-[45%]">
                                                                <div className="text-left ml-3 xl:hidden block"> {item?.product?.name} </div>
                                                                <div className="text-left ml-3 xl:hidden block "> {item?.product?.sizes[0]?.size}</div>
                                                                <div className="text-left ml-3 xl:hidden block  text-[red] font-medium"> {formatCurrency(item?.product?.sizes[0]?.price)} </div>
                                                            </div>
                                                            <div className=" w-[40%]">
                                                                <div className=" xl:hidden block">
                                                                    <span onClick={(event) => event.stopPropagation()}>
                                                                        <InputNumber min={1} value={item?.selectedQuantity} onChange={(value) => onChangeQ(value, i, item)} className="xl:w-[80px] w-[50px]" />
                                                                    </span>
                                                                </div>
                                                                <div onClick={() => handleDelete(i, item?.product?._id, item.selectedSize)} className=" xl:hidden block mt-2">
                                                                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeWidth="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-[40%]  py-4 xl:block hidden xl:text-base text-sm">
                                                        <span onClick={(event) => event.stopPropagation()}>
                                                            <InputNumber min={1} value={item?.selectedQuantity} onChange={(value) => onChangeQ(value, i, item)} className="xl:w-[80px] w-[50px]" />
                                                        </span>
                                                    </div>

                                                    <div className="w-[40%]  py-4 xl:block hidden xl:text-base text-sm">
                                                        <div className="">{item?.product?.sizes.find(s => s.size == item?.selectedSize && s.quantity >= item.selectedQuantity)
                                                            ? item?.selectedSize

                                                            : (item?.product == null) ? <span className="text-red-500">Sản phẩm không tồn tại</span> : <button onClick={() => {
                                                                setIsModalChooseSize(true);
                                                                setItemChooseSize(item)
                                                                setSelectSize(item?.product?.sizes?.find(item => item?.quantity > 0))
                                                                setIndexCart(i)
                                                            }}>Chọn lại size</button>}
                                                        </div>
                                                    </div>

                                                    <div className="w-[40%]  py-4 xl:block hidden xl:text-base text-sm">
                                                        <div className=" text-[red]">{item?.product?.sizes.find(s => s.size == item?.selectedSize && item?.product != null) ? formatCurrency(item?.product?.sizes.find(s => s?.size == item?.selectedSize)?.price) : ""}</div>
                                                    </div>

                                                    <div onClick={() => handleDelete(i, item.product._id, item.selectedSize)} className=" w-[20%] py-4 xl:block hidden xl:text-base text-sm">
                                                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeWidth="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </div>

                                                    {
                                                        !item?.product?.sizes.find(s => s.size == item?.selectedSize && s.quantity >= item.selectedQuantity) && !item?.product?.sizes.some(s => s.quantity > 0) && item?.product != null
                                                            ? <div className="absolute top-0 right-0">Hết hàng</div> : undefined
                                                    }

                                                    {/* {
                                                        item?.product == null && <div className="absolute top-0 right-0">Sản phẩm không tồn tại</div>
                                                    } */}
                                                </div>
                                            )
                                        })
                                    }

                                    {/* call api */}

                                </div>

                            </div>

                            <div className="h-full mt-10 rounded-lg  bg-neutral-50 p-1  shadow-xl border">
                                <div className=" flex justify-between">
                                    <div></div>
                                    <div className="xl:w-96 w-full p-2">
                                        <div className="flex justify-between xl:text-base text-sm">
                                            <h3 className=" mt-[10px]  flex "><i className="fa-solid fa-ticket mt-[1px] text-[#000000b6]"></i>
                                                <span className="ml-1"> Phiếu ưu đãi</span></h3>
                                            <button className="relative mt-2 font-medium text-sm hover:underline text-[#0000ffc7]" onClick={() => { toggleModal(0, true) }}>
                                                Chọn hoặc nhập mã
                                            </button>
                                        </div>
                                        <div className="flex justify-between  my-2 xl:text-base text-sm">
                                            <p className="">Số Lượng</p>
                                            <p>{calculateTotalQuantity(listProductChecked)}</p>
                                        </div>
                                        {/* <div className="flex justify-between ">
                                            <p className="">Tổng giá Tiền</p>
                                            <p className="">{formatCurrency(totalPrice)}</p>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="flex justify-between p-2">
                                    <div className="flex">
                                        <button onClick={handleSelectAll} className=" xl:p-2 p-1 flex xl:w-36 w-16">
                                            <input type="checkbox" className="my-2" checked={selectAllChecked} />
                                            <div className="xl:ml-3 ml-1 flex xl:text-base text-sm  mt-1"><p className="xl:text-base text-sm xl:block hidden mr-1">Chọn</p>tất cả <span className="xl:block hidden">( {cartCount} )</span></div>
                                        </button>

                                        <button className="w-16  mx-2 xl:block hidden" onClick={handleDeleteAllCart}>
                                            Xóa
                                        </button>
                                        <Link to="/products" className="  text-center p-2 xl:block hidden">
                                            Tiếp tục xem sản phẩm
                                        </Link>
                                    </div>

                                    <div className="flex ">
                                        <div className="p-2 xl:flex  ">
                                            <div className="flex xl:text-base text-sm">
                                                Tổng thanh toán
                                                <span className="xl:block hidden">
                                                    ( {selectedProductCount} Sản phẩm ):
                                                </span>
                                            </div>
                                            <span className="text-[red] font-medium xl:text-xl text-sm ml-3 -mt-0.5 ">
                                                {formatCurrency(totalPrice)} <span className="text-blue-500 text-sm">{salePrice ? `( -${formatCurrency(salePrice)} )` : ''}</span>
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleNavigateCheckOut}
                                            className=" xl:w-56 w-28 ml-2  text-white font-medium xl:text-base text-sm bg-[#ee4d2d] hover:bg-[#ee4d2dbe]"
                                        >
                                            Mua Hàng{" "}
                                            <span className="xl:hidden block text-xs ml-1">
                                                ( {cartCount} )
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className=" min-h-[70vh]  xl:pt-14 pt-24 text-center ">
                        <img className=" mx-auto" src="https://dcstore.vn/assets/image/empty-cart.png" alt="Giỏ hàng trống" />
                        <div >Giỏ hàng trống, hãy mua hàng!</div>
                    </div>
                )
            }

            {/* Modal voucher */}
            <Modal
                title="Chọn mã giảm giá"
                open={isModalOpen[0]}
                onOk={() => toggleModal(0, false)}
                onCancel={() => toggleModal(0, false)}
                footer=""

            >
                {
                    userVoucher?.length > 0 && userVoucher ? (
                        <div>
                            <div className="coupon pt-[10px] flex">
                                <h3 className="widget-title mt-[10px] text-slate-400 flex w-20 py-2">
                                    Mã ưu đãi
                                </h3>
                                <div className="relative m-2 w-full">
                                    <input
                                        readOnly
                                        defaultValue={selectedVoucher?.code}
                                        type="search"
                                        id="default-search"
                                        className="block p-2.5 pl-2 w-full text-sm text-gray-900 bg-gray-200 rounded-lg outline-none  focus:ring-blue-500 "
                                        required
                                    />
                                    <button
                                        onClick={() => {
                                            // toggleModal(0, false);
                                            applyVoucher();
                                        }}
                                        type="submit"
                                        className="text-white absolute right-1.5 bottom-[7px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1 "
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                            <div className="h-[70vh] overflow-scroll">
                                {userVoucher
                                    ?.sort((a, b) => {
                                        // Sắp xếp voucher theo trạng thái: còn hạn, hết hạn, đã sử dụng
                                        if (a.apply || moment().isBefore(moment(a?.expirationDate[0]))) {
                                            if (!b.apply && moment().isAfter(moment(b?.expirationDate[1]))) {
                                                return -1; // a còn hạn, b hết hạn
                                            } else if (b.apply) {
                                                return -1; // a còn hạn, b đã sử dụng
                                            } else if (!b.apply && !moment().isBefore(moment(b?.expirationDate[0]))) {
                                                return 1; // a còn hạn, b còn hạn nhưng sau a
                                            }
                                        } else if (!a.apply && !moment().isBefore(moment(a?.expirationDate[0]))) {
                                            if (!b.apply && moment().isAfter(moment(b?.expirationDate[1]))) {
                                                return -1; // a hết hạn, b hết hạn
                                            } else if (b.apply) {
                                                return -1; // a hết hạn, b đã sử dụng
                                            } else if (!b.apply && !moment().isBefore(moment(b?.expirationDate[0]))) {
                                                return 1; // a hết hạn, b còn hạn nhưng sau a
                                            }
                                        } else if (a.apply) {
                                            if (!b.apply) {
                                                return 1; // a đã sử dụng, b còn hạn
                                            }
                                        }
                                        return 0;
                                    })
                                    ?.filter(i => i?.maximum > 0)?.map((item, i) => {
                                        return (
                                            <label
                                                key={i}
                                                htmlFor={`voucher-${i}`}
                                                className="flex w-full border mt-3 shadow cursor-pointer"
                                            >
                                                <svg
                                                    width="25%"
                                                    // height="25%"
                                                    viewBox="0 0 106 106"
                                                    fill="none"
                                                    className=""
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M0 2a2 2 0 0 1 2-2h106v106H2a2 2 0 0 1-2-2v-3a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 1 0 0-6v-4a3 3 0 0 0 0-6V2Z"
                                                        fill="#00bfa5"
                                                    ></path>
                                                    <text
                                                        x="10"
                                                        y="50"
                                                        fontFamily="Arial"
                                                        fontWeight={700}
                                                        fontSize="15"
                                                        fill="white"
                                                    >
                                                        Mã giảm giá
                                                    </text>
                                                    <text
                                                        x="15"
                                                        y="75"
                                                        fontFamily="Arial"
                                                        fontWeight={400}
                                                        fontSize="14"
                                                        fill="white"
                                                    >
                                                        BossHouse
                                                    </text>
                                                </svg>
                                                <div className="relative">
                                                    <div className="absolute top-1 right-1">
                                                        {item.apply
                                                            ? "Đã sử dụng"
                                                            : moment().isBefore(moment(item?.expirationDate[0]))
                                                                ? "Chưa bắt đầu"
                                                                : moment().isAfter(moment(item?.expirationDate[1]))
                                                                    ? "Đã kết thúc"
                                                                    : "Đang diễn ra"}
                                                    </div>
                                                    <div className="flex justify-between py-4 px-3 ">
                                                        <div className="w-[75%]">
                                                            <p className="xl:text-base text-xs font-bold">
                                                                {item?.code}
                                                            </p>
                                                            <h3 className="xl:text-sm text-xs my-1">
                                                                Giảm {item?.discountPercent}% Giảm tối đa{" "}
                                                                {formatCurrency(item?.maxDiscount)}
                                                            </h3>
                                                            <p className="xl:text-sm text-xs">
                                                                Thời gian {moment(item?.expirationDate[0]).format("DD/MM/YYYY HH:mm")} đến{" "}
                                                                {moment(item?.expirationDate[1]).format("DD/MM/YYYY HH:mm")}
                                                            </p>
                                                            <p>Còn lại: {item?.maximum}</p>
                                                        </div>
                                                        <button className="px-3 w-[20%] ">
                                                            <input
                                                                type="radio"
                                                                name="voucherIndex"
                                                                value={item?.code}
                                                                disabled={item?.apply || moment().isBefore(moment(item?.expirationDate[0])) || moment().isAfter(moment(item?.expirationDate[1]))}
                                                                onChange={() => {
                                                                    setSelectedVoucher(item);
                                                                    setVoucherApplied(false);
                                                                }}
                                                                checked={selectedVoucher === item}
                                                                id={`voucher-${i}`}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                            </div>
                        </div>
                    ) : <div>Bạn hiện chưa có mã giảm giá nào</div>
                }
            </Modal>

            {/* Modal Chọn lại size */}
            <Modal title="Chọn lại size" open={isModalChooseSize} onOk={handleOk} onCancel={handleCancel}>
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <img src={itemChooseSize?.product?.images[0].response.urls[0]} alt="Product" className="w-24 h-24 mr-6 object-cover rounded-md shadow-md" />
                        <div>
                            <p className="text-lg font-semibold text-gray-800">{itemChooseSize?.product?.name}</p>
                            <p className="text-sm text-gray-600">{itemChooseSize?.product?.description}</p>
                            <p className="text-sm text-gray-600">Còn lại: {selectSize?.quantity || 0}</p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Chọn kích thước:</p>
                        <span onClick={(event) => event.stopPropagation()}>
                            <InputNumber min={1} value={selectQuantity} max={selectSize?.quantity} onChange={(value) => setSelectQuantity(value)} className="xl:w-[80px] w-[50px]" />
                        </span>
                        <div className="flex mt-3 flex-wrap gap-3">
                            {itemChooseSize?.product?.sizes?.map((item) => {
                                const isAvailable = item?.quantity > 0;
                                const isSelected = selectSize?.size == item?.size;

                                const buttonClasses = `px-4 py-2 bg-white text-black rounded-md shadow-sm ${isSelected ? 'bg-gray-700 text-white' : ''}`;
                                const disabledButtonClasses = `px-4 py-2 bg-gray-500 text-gray-800 rounded-md shadow-sm cursor-not-allowed`;

                                return (
                                    <button
                                        key={item.size}
                                        disabled={!isAvailable}
                                        onClick={() => {
                                            setSelectSize(item)
                                            setSelectQuantity(1)
                                        }}
                                        className={isAvailable ? buttonClasses : disabledButtonClasses}
                                    >
                                        {item?.size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>

        </>

    );

}


export default Cart;