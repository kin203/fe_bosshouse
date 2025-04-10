import moment from "moment";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Checkbox, Modal, Select } from "antd";
import { formatCurrency } from "../../../utils/products";
import { createPaymentVnPay } from "../../../services/vnpay";
import { useEffect, useState } from "react";
// import PayPalButton from "../../../components/paypal/PaypalButton";
import { getProduct, updateManyQuantity } from "../../../services/products";
import { useGetCartByUserId, useUpdateCartByUserId } from "../../../hooks/apis/carts";
import { setCartQuantity } from "../../../redux/slices/Cart";
import { updateCartByUserId } from "../../../services/cart";
import { addNotification } from "../../../services/notification";
import { useUser } from "../../../hooks/apis/users";
import './customRadio.css'
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAddUserAddress, useDeleteUserAddress, useFindUserAddressByUserId, useUpdateUserAddress } from "../../../hooks/apis/userAddress";
import { v4 as uuidv4 } from 'uuid';
import { useAddOrder, useDeleteOrder } from "../../../hooks/apis/order";
import Loading from "../../../components/loading/Loading";
import { useGetVoucherByUserId, useUpdateApplyVoucher } from "../../../hooks/apis/voucher";
import { setLastPriceCart } from "../../../redux/slices/listProductCartSelected";
import { setCodeR, setSalePriceR, setVoucherId } from "../../../redux/slices/voucher";
import { setInfoOrderR, setPriceOrder } from "../../../redux/slices/order";
import { sendMail } from "../../../services/email";
import { useQueryClient } from "@tanstack/react-query";
import { setReload } from "../../../redux/slices/Reload";


const Checkout = () => {
    const next = useNavigate();
    const dispatch = useDispatch()
    const [disabled, setDisabled] = useState(false);
    const [statusCheckedEmailOrder, setStatusCheckedEmailOrder] = useState(false);
    const userSession = sessionStorage.getItem("user");
    const user = JSON.parse(userSession);
    const [selectedPayment, setSelectedPayment] = useState('payoff')
    const { data } = useGetCartByUserId({ userId: user?._id })
    const [infoOrder, setInfoOrder] = useState({
        message: "",
        fullName: "",
        phoneNumber: 0,
        address: "",
        transportFee: 0,
        email: "",
        street: ""
    });
    const { mutateAsync: updateApplyVoucher } = useUpdateApplyVoucher()
    // modal address
    const { mutateAsync: addUserAddress } = useAddUserAddress()
    const { mutateAsync: updateUserAddress } = useUpdateUserAddress()
    const { mutateAsync: deleteUserAddress } = useDeleteUserAddress()
    const { data: listAddressByUser } = useFindUserAddressByUserId({ userId: user?._id })
    const [modalChangeAdressOpen, setModalChangeAddressOpen] = useState(false);
    const [modalAddAdressOpen, setModalAddAddressOpen] = useState(false);
    const [modalUpdateAddressOpen, setModalUpdateAddressOpen] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState(false);
    const [dataAddress, setDataAddress] = useState(null);
    const [checkedAddress, setCheckedAddress] = useState(null);

    useEffect(() => {

        if (listAddressByUser?.data) {
            setCheckedAddress(listAddressByUser?.data?.find(i => i.default == true) || null)
        }

        setDataAddress(listAddressByUser?.data)
    }, [listAddressByUser]);
    // end modal address

    const [lastPriceInit, setLastPriceInit] = useState(0)

    const { mutateAsync: useUpdateCart } = useUpdateCartByUserId()
    const { mutateAsync: addOrder } = useAddOrder()

    const { listProductCartSelected, lastPrice } = useSelector(
        (state: { listProductCartSelected: any }) => state.listProductCartSelected
    );

    useEffect(() => {
        setLastPriceInit(lastPrice)
    }, []);

    const { voucherId, salePrice, code } = useSelector((state: { voucher: any }) => state.voucher)
    // console.log(voucherId)
    const { priceOrder } = useSelector((state: any) => state.infoOrder)
    // console.log(priceOrder)
    console.log(lastPrice)
    console.log(salePrice)

    useEffect(() => {
        // Nếu load lại page thì listProductCartSelected = [] sẽ chuyển hướng về trang giỏ hàng
        if (listProductCartSelected?.length == 0 || lastPrice == 0) {
            next("/cart");
        }
    }, [listProductCartSelected, lastPrice]);

    // API Giao Hàng Nhanh
    const [citys, setCity] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    useEffect(() => {
        //fetch thành phố
        const fetchProvinceData = async () => {
            try {
                const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': 'c318d776-ea3f-11ee-8d6a-5276b526e4bb'
                    }
                });
                const { data } = await response.json();
                setCity(data?.map((item) => ({ label: item?.ProvinceName, value: item?.ProvinceID })));
            } catch (error) {
                console.error('Error fetching province data:', error);
            }
        };

        fetchProvinceData();
    }, []);

    // Fetch quận huyện
    useEffect(() => {
        const fetchDistrictData = async () => {
            if (selectedCity) {
                try {
                    const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': 'c318d776-ea3f-11ee-8d6a-5276b526e4bb'
                        },
                        body: JSON.stringify({
                            province_id: selectedCity?.value
                        })
                    });
                    const { data } = await response.json();
                    setDistricts(data?.map((item) => ({ label: item?.DistrictName, value: item?.DistrictID })));
                } catch (error) {
                    console.error('Lỗi khi tải dữ liệu quận huyện:', error);
                }
            }
        };

        fetchDistrictData();
    }, [selectedCity]);

    // Fetch thị xã
    useEffect(() => {
        const fetchWardData = async () => {
            if (selectedDistrict) {
                try {
                    const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': 'c318d776-ea3f-11ee-8d6a-5276b526e4bb'
                        },
                        body: JSON.stringify({
                            district_id: selectedDistrict?.value
                        })
                    });
                    const { data } = await response.json();
                    setWards(data?.map((item) => ({ label: item?.WardName, value: item?.WardCode })));
                } catch (error) {
                    console.error('Lỗi khi tải dữ liệu phường xã:', error);
                }
            }
        };

        fetchWardData();
    }, [selectedDistrict]);

    // Kiểm tra gói dịch vụ
    const [serviceTypeId, setServiceTypeId] = useState(2)
    useEffect(() => {
        const getAvailableService = async () => {
            try {
                const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': 'c318d776-ea3f-11ee-8d6a-5276b526e4bb'

                    },
                    body: JSON.stringify({
                        'shop_id': 4511081,
                        "from_district": 1915, // id huyện Chương mỹ
                        "to_district": Number(checkedAddress?.district?.value),
                    })
                })
                const data = await response.json();
                // console.log('service: ', data.data[0]);
                if (data?.data[0]) {
                    setServiceTypeId(data?.data[0]?.service_type_id)
                }

            } catch (error) {
                console.error('Lỗi khi tải dữ liệu gói dịch vụ:', error);
            }
        }
        getAvailableService()
    }, [checkedAddress])

    // Tính cước phí vận chuyển
    const [transportFee, setTransportFee] = useState(0);
    useEffect(() => {
        const calculateShippingFee = async () => {
            try {
                const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': 'c318d776-ea3f-11ee-8d6a-5276b526e4bb',
                        'shop_id': '4511081'
                    },
                    body: JSON.stringify({
                        "service_type_id": serviceTypeId,
                        "insurance_value": lastPrice,
                        "coupon": null,
                        "from_district_id": 1915, // id huyện Chương mỹ
                        "to_district_id": Number(checkedAddress?.district?.value),
                        "to_ward_code": checkedAddress?.ward?.value,
                        "height": 15,
                        "length": 15,
                        "weight": 1000,
                        "width": 20
                    })
                });
                // console.log(serviceTypeId);

                const data = await response.json();
                // console.log(data)
                const calculatedShippingFee = data?.data?.total
                if (checkedAddress) {
                    if (calculatedShippingFee) {
                        setTransportFee(calculatedShippingFee);
                    }

                    return <><Loading /> </>

                }
            } catch (error) {
                console.error('Lỗi khi tính cước phí vận chuyển:', error);
            }
        };

        calculateShippingFee();
    }, [checkedAddress, serviceTypeId]);

    // End API Giao Hàng Nhanh



    // console.log(listProductCartSelected)

    const addToOrder = async () => {
        if (!checkedAddress) {
            Swal.fire({
                icon: "error",
                title: "Vui lòng thêm địa chỉ giao hàng!",
            });
            return;
        }

        if (priceOrder == lastPrice + transportFee) {
            Swal.fire({
                title: 'Đơn hàng của bạn đã gửi đi!',
                icon: 'warning',
            })
            return
        }

        try {
            switch (selectedPayment) {
                case "payoff":
                    try {
                        setDisabled(true);
                        const date = new Date();
                        const infoAddOrder = {
                            userId: user._id,
                            fullName: checkedAddress.fullName,
                            email: checkedAddress.email,
                            phoneNumber: checkedAddress.phoneNumber,
                            address: `Số nhà/Đường: ${checkedAddress.street || 'Không xác định'} - ${checkedAddress.ward.label} - ${checkedAddress.district.label} - Thành phố ${checkedAddress.city.label}`,
                            products: listProductCartSelected.map((item) => {
                                // console.log(item)
                                return {
                                    productId: item?.product?._id,
                                    selectedSize: item?.selectedSize,
                                    selectedQuantity: item?.selectedQuantity,
                                    message: checkedAddress.message || "không có lời nhắn",
                                    paymentMethod: "Thanh toán khi nhận hàng",
                                    initNameProduct: item?.product?.name,
                                    initPriceProduct: (item?.product.sizes.find(s => s.size == item?.selectedSize)?.price || 0),
                                    initImportPriceProduct: (item?.product.sizes.find(s => s.size == item?.selectedSize)?.importPrice || 0),
                                    initImageProduct: item?.product.images[0].response.urls[0]
                                };
                            }),
                            transportFee,
                            totalPrice: (lastPrice - (salePrice || 0)) + transportFee,
                            salePrice: salePrice || 0,
                        };

                        // addOrder(infoAddOrder);
                        let res = await addOrder(infoAddOrder);
                        // console.log(res.data.newOrder)
                        await updateManyQuantity(listProductCartSelected)

                        dispatch(setPriceOrder(lastPrice + transportFee))

                        const productsInAOnly = data?.data?.carts.filter((itemA) => {
                            // Kiểm tra xem có phần tử nào trong listProductCartSelected có productId trùng với itemA không
                            return !listProductCartSelected.some(
                                (itemB) => itemB?.product?._id == itemA?.product?._id && itemB?.selectedSize == itemA?.selectedSize
                            );
                        });
                        // Cập nhật lại số sản phẩm còn lại trong giỏ hàng
                        useUpdateCart({
                            userId: user._id, carts: productsInAOnly?.map(item => {
                                return {
                                    _id: item?.product?._id,
                                    selectedSize: item?.selectedSize,
                                    selectedQuantity: item?.selectedQuantity
                                }
                            })
                        });

                        if (voucherId) {
                            // Cập nhật trạng thái voucher của người dùng
                            updateApplyVoucher({ userId: user._id, voucherId: voucherId });
                            // console.log(res)
                        }

                        // Thông báo tới admin
                        await addNotification({
                            to: "admin",
                            username: user.username,
                            userId: user?._id,
                            title: `${user.username} đã đặt 1 đơn hàng`,
                            content: `Đơn hàng được tạo vào ${moment(date).format("DD/MM/YYYY HH:mm")}`,
                        })

                        if (statusCheckedEmailOrder) {
                            const newProducts = await Promise.all(res.data.newOrder.products.map(async (product) => {
                                const product1 = await getProduct(product.productId);
                                return { ...product1.data, ...product };
                            }));

                            // send status to client
                            const res1 = await sendMail({
                                email: checkedAddress.email,
                                type: "order",
                                orderId: "",
                                status: "Chờ Xác Nhận",
                                data: { ...res.data.newOrder, products: newProducts }
                            })
                            // console.log(res1)
                        }

                        setDisabled(false)

                        Swal.fire({
                            title: "Đặt hàng thành công!",
                            text: "Đơn hàng sẽ được giao đến bạn trong vài ngày tới.",
                            icon: "success",
                        }).then(() => {
                            // Update lại số lượng sp trong giỏ hàng
                            dispatch(setCartQuantity(productsInAOnly?.length))

                            dispatch(setInfoOrderR(infoAddOrder as any))
                            next("/order-orderPaymentDelivery");
                        })

                        // });
                    } catch (error) {
                        console.log(error);
                        Swal.fire({
                            title: 'Thanh toán không thành công!',
                            text: error?.response?.data?.message,
                            icon: "error"
                        })
                    }
                    break;

                case "vnpay":
                    try {
                        if (!checkedAddress) {
                            Swal.fire({
                                icon: "error",
                                title: "Vui lòng thêm địa chỉ giao hàng!",
                            });
                        } else {
                            setDisabled(true)

                            const date = new Date();
                            const infoAddOrder = {
                                userId: user._id,
                                fullName: checkedAddress.fullName,
                                email: checkedAddress.email,
                                phoneNumber: checkedAddress.phoneNumber,
                                address: `Số nhà/Đường: ${checkedAddress.street} - ${checkedAddress.ward.label} - ${checkedAddress.district.label} - Thành phố ${checkedAddress.city.label}`,
                                products: listProductCartSelected.map((item) => {
                                    // console.log(item)
                                    return {
                                        productId: item?.product?._id,
                                        selectedSize: item?.selectedSize,
                                        selectedQuantity: item?.selectedQuantity,
                                        message: checkedAddress.message || "không có lời nhắn",
                                        paymentMethod: "Thanh toán qua VnPay",
                                        initNameProduct: item?.product?.name,
                                        initPriceProduct: (item?.product.sizes.find(s => s.size == item?.selectedSize)?.price || 0),
                                        initImageProduct: item?.product.images[0].response.urls[0],
                                        initImportPriceProduct: (item?.product.sizes.find(s => s.size == item?.selectedSize)?.importPrice || 0),
                                    };
                                }),
                                transportFee,
                                totalPrice: (lastPrice - (salePrice || 0)) + transportFee,
                                salePrice: salePrice || 0,
                            };


                            // Thêm order
                            const res = await addOrder(infoAddOrder);

                            // localStorage.setItem('idOrder', res?.data?.newOrder?._id)
                            localStorage.setItem('idOrder', res?.data?.newOrder?.orderCode.slice(1))

                            // Set infoAddOrder vào localstorage để lấy ra bên order-confirmation
                            localStorage.setItem(`infoAddOrder`, JSON.stringify({ ...infoAddOrder, voucherId, listProductCartSelected, _id: res?.data?.newOrder?._id }));

                            // Lấy ra _id order khi đã thêm vào db
                            const dataPayment = {
                                // amount: lastPrice + transportFee,
                                amount: (lastPrice - salePrice) + transportFee,
                                // orderId: res?.data?.newOrder?._id,
                                orderId: res?.data?.newOrder?.orderCode?.slice(1),
                                bankCode: "VNBANK",
                                language: "vn"
                            };

                            setDisabled(false)

                            if (dataPayment) {
                                const resVNPay = await createPaymentVnPay(dataPayment);
                                // console.log(resVNPay)
                                window.location.href = resVNPay?.data;
                                // window.open(resVNPay.data);
                            }
                        }
                    } catch (error) {
                        console.log('Thanh toán lỗi: ', error);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error);
        }

    };

    console.log(voucherId)

    //modal address
    useEffect(() => {
        if (dataAddress?.length == 0) {
            setCheckedAddress(null)
            setTransportFee(0)
        }
    }, [dataAddress]);

    const onAddAddress = () => {
        addUserAddress({
            userId: user._id,
            ...infoOrder,
            city: selectedCity,
            district: selectedDistrict,
            ward: selectedWard,
            default: defaultAddress
        })
    }

    const [addressUpdate, setAddressUpdate] = useState(null)
    const handleUpdateAddress = () => {
        updateUserAddress({ ...addressUpdate, _id: addressUpdate._id })
        setCheckedAddress(addressUpdate)
    }

    const handleDeleteAddress = (id) => {
        Swal.fire({
            title: "Xác nhận xóa địa chỉ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Không",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    deleteUserAddress(id)
                    // setCheckedAddress(listAddressByUser.data[0])
                    if (dataAddress?.length == 1) {
                        setCheckedAddress(null)
                        setDataAddress([])

                        setTransportFee(0)
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }


    // voucher
    const [userVoucher, setUserVoucher] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState([false, false]);
    const [voucherApplied, setVoucherApplied] = useState(false);

    const { data: userVoucher1 } = useGetVoucherByUserId({ userId: user?._id })
    useEffect(() => {
        setUserVoucher(userVoucher1?.data?.codes);
    }, [userVoucher1]);

    const toggleModal = (idx, target) => {
        setIsModalOpen((p) => {
            p[idx] = target;
            return [...p];
        });
    };

    useEffect(() => {
        if (voucherId && userVoucher) {
            setSelectedVoucher(userVoucher.find(voucher => voucher?.codeId == voucherId))
        }
    }, [voucherId, userVoucher]);

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
        // if (selectedVoucher?.apply == true) {
        //     Swal.fire({
        //         title: "Voucher này bạn đã sử dụng rồi.",
        //         icon: "warning",
        //     });
        //     return;
        // }

        // Kiểm tra nếu chưa chọn voucher
        if (!selectedVoucher) {
            Swal.fire({
                title: "Vui lòng chọn 1 mã giảm giá.",
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
            let salePrice = (lastPriceInit * discount) / 100;
            if (salePrice > selectedVoucher?.maxDiscount) {
                salePrice = selectedVoucher?.maxDiscount;
            }

            dispatch(setLastPriceCart(lastPriceInit))
            dispatch(setSalePriceR(salePrice as any))
            dispatch(setCodeR(selectedVoucher.code))
            dispatch(setVoucherId(selectedVoucher._id));

            Swal.fire({
                title: "Áp dụng voucher thành công!",
                icon: "success",
            })

            toggleModal(0, false);

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

    // console.log(voucherId, salePrice, code)
    // console.log(statusCheckedEmailOrder)
    const reload = useSelector((state: { reload: any }) => state.reload);
    useEffect(() => {
        // When the component mounts, check if "reload" is true
        // If it is, set it to false and reload the page
        if (reload) {
            dispatch(setReload(false));
            window.location.reload();
        }
    }, [reload]);
    return (
        <>
            <div className="min-w-screen min-h-screen bg-gray-50 py-4 xl:mt-14 mt-10">
                <div className="px-5">
                    <div className="mb-2">
                        <h1 className="text-3xl md:text-5xl font-bold ">Thanh Toán</h1>
                    </div>
                    <div className="mb-4 font-medium">
                        <Breadcrumb
                            items={[
                                { title: <Link to="/">Trang Chủ</Link> },
                                { title: <Link to="/cart">Giỏ Hàng</Link> },
                                { title: "Thanh Toán" },
                            ]}
                        />
                    </div>
                </div>
                <div className="w-full bg-white border-t border-gray-200 px-5 py-10 ">
                    <div className="w-full">
                        <div className="-mx-3 md:flex items-start">
                            <div className="px-3 md:w-7/12 lg:pr-10">
                                <div className="w-full mx-auto  font-light mb-6 ">
                                    {listProductCartSelected?.map((item, i) => {
                                        // console.log(item)
                                        return (
                                            <div key={i} className="w-full flex items-center mb-2 border-b pb-2 ">
                                                <div className="overflow-hidden rounded-lg w-16 h-16 bg-gray-50  border-gray-200">
                                                    <img
                                                        src={item?.product?.images[0]?.response?.urls[0]}
                                                        alt="img"
                                                    />
                                                </div>
                                                <div className="flex-grow pl-3">
                                                    <h6 className="font-medium uppercase">
                                                        {item?.product?.name}
                                                    </h6>
                                                    <div>
                                                        <p className="font-medium text-[blue]">x {item?.selectedQuantity}</p>
                                                        <span className="font-medium text-xs">Phân Loại: {item?.selectedSize}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-semibold pt-2">
                                                        {formatCurrency(item?.product?.sizes?.find(s => s.size == item?.selectedSize)?.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mb-6 pb-6 border-b border-gray-200 ">
                                    <div className="w-full flex mb-3 items-center">
                                        <div className="flex-grow">
                                            <span className=" font-medium"><i className="fa-solid fa-ticket mt-[1px] text-[#000000b6] mr-1"></i>Phiếu ưu đãi</span>
                                        </div>
                                        <div className="pl-3">
                                            {
                                                salePrice &&
                                                <div>
                                                    <span>Đã áp dụng voucher: <span className="font-bold">{code}</span></span>
                                                </div>
                                            }


                                            <button className="relative mt-2 font-medium text-sm hover:underline text-[#0000ffc7]" onClick={() => { toggleModal(0, true) }}>
                                                Chọn hoặc nhập mã
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full flex mb-3 items-center">
                                        <div className="flex-grow">
                                            <span className=" font-medium">Tổng tiền hàng :</span>
                                        </div>
                                        <div className="pl-3">
                                            <span className="font-semibold">
                                                {formatCurrency(lastPriceInit)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full flex mb-3 items-center">
                                        <div className="flex-grow">
                                            <span className="font-medium">Đã áp dụng voucher:</span>
                                        </div>
                                        <div className="pl-3">
                                            <span className="font-semibold">
                                                {salePrice ? formatCurrency(lastPriceInit - salePrice) : formatCurrency(0)} <span className="text-[13px] text-blue-500">{salePrice ? `( -${formatCurrency(salePrice)} )` : ""}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full flex items-center">
                                        <div className="flex-grow">
                                            <span className=" font-medium">Vận chuyển</span>
                                        </div>
                                        <div className="pl-3">
                                            <span className="font-semibold">{transportFee == 0 ? <Loading /> : formatCurrency(transportFee)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className=" pb-6 border-b border-gray-200 md:border-none  text-xl">
                                    <div className="w-full flex items-center">
                                        <div className="flex-grow">
                                            <span className=" font-medium">Thành tiền :</span>
                                        </div>
                                        <div className="pl-3 text-[red] font-bold">
                                            {lastPrice != 0
                                                ? formatCurrency(lastPriceInit - salePrice + (transportFee || 0))
                                                : <Loading />}
                                        </div>
                                    </div>
                                </div>


                            </div>
                            <div className="px-3 md:w-5/12 xl:mt-[-40px]">
                                <div className="my-3 ">
                                    <h3 className="xl:text-3xl text-[26px] font-bold">
                                        Thông tin đặt hàng
                                    </h3>
                                    <div className="m-2 leading-7">

                                        <div className="text-xl font-medium ">
                                            <div className="flex gap-2 text-slate-700 items-center">
                                                <svg height="16" viewBox="0 0 12 16" width="12" className="shopee-svg-icon icon-location-marker">
                                                    <path d="M6 3.2c1.506 0 2.727 1.195 2.727 2.667 0 1.473-1.22 2.666-2.727 2.666S3.273 7.34 3.273 5.867C3.273 4.395 4.493 3.2 6 3.2zM0 6c0-3.315 2.686-6 6-6s6 2.685 6 6c0 2.498-1.964 5.742-6 9.933C1.613 11.743 0 8.498 0 6z" fillRule="evenodd"></path>
                                                </svg>

                                                <h2 className="font-medium text-lg my-2">Địa chỉ nhận hàng</h2>
                                                <button onClick={() => setModalChangeAddressOpen(true)} className="text-blue-500 mt-1 text-sm ">{checkedAddress ? 'Thay đổi' : 'Chọn địa chỉ'}</button>

                                                <Modal
                                                    className="flex"
                                                    title="Địa chỉ của tôi"
                                                    centered
                                                    open={modalChangeAdressOpen}
                                                    onOk={() => setModalChangeAddressOpen(false)}
                                                    onCancel={() => setModalChangeAddressOpen(false)}
                                                >

                                                    <ul className="w-full text-sm font-thin text-gray-900 bg-white rounded-lg">
                                                        {dataAddress?.map((item, index) => (
                                                            <li key={index} className="border-b m-2 border-gray-200 border-x-none rounded-t-lg flex items-center">
                                                                <div onClick={() => setCheckedAddress(item)} className="flex items-center radio-button ps-3 w-full">
                                                                    <input
                                                                        id={item._id}
                                                                        type="radio"
                                                                        checked={checkedAddress?._id == item._id}
                                                                        className="radio-button__input"
                                                                    />
                                                                    <label htmlFor="address" className="radio-button__label w-full ">
                                                                        <span className="radio-button__custom"></span>
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="max-w-[70%] ">
                                                                                <div>
                                                                                    <span className="font-normal pr-2 border-r-2">{item?.fullName}</span>
                                                                                    <span className="pl-2">(+84) {item?.phoneNumber}</span>
                                                                                    <p>{item?.email}</p>
                                                                                </div>
                                                                                <div>{item?.street}, {item?.ward?.label}, {item?.district?.label}, {item?.city?.label}</div>
                                                                            </div>
                                                                            <div className="text-xl flex flex-wrap align-center space-x-2">
                                                                                <button aria-label="open" onClick={(e) => {
                                                                                    // e.stopPropagation()
                                                                                    setAddressUpdate(item)
                                                                                    setModalUpdateAddressOpen(true)
                                                                                }} className="text-blue-400">
                                                                                    <EditOutlined />
                                                                                </button>
                                                                                <button aria-label='delete' className="text-red-400" onClick={() => handleDeleteAddress(item._id)}>
                                                                                    <DeleteOutlined />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>


                                                    <button onClick={() => setModalAddAddressOpen(true)} className=" text-gray-700 rounded-lg relative m-3 w-36 h-10 cursor-pointer flex items-center border border-blue-500  group  overflow-hidden">
                                                        <span className=" ml-6 transform group-hover:translate-x-20 transition-all duration-300">
                                                            Thêm mới
                                                        </span>
                                                        <span className="absolute right-0 h-full w-10 rounded-lg hover:bg-white hover:text-blue-500 active:bg-blue-500 active:text-white flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
                                                            <svg className="svg w-8" fill="none" width="24" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <line x1="12" x2="12" y1="5" y2="19"></line>
                                                                <line x1="5" x2="19" y1="12" y2="12"></line>
                                                            </svg>
                                                        </span>
                                                    </button>

                                                    {/* Modal Thêm địa chỉ */}
                                                    <Modal
                                                        className="flex"
                                                        title="Địa chỉ mới"
                                                        centered
                                                        open={modalAddAdressOpen}
                                                        onOk={() => {
                                                            onAddAddress()
                                                            setModalAddAddressOpen(false)
                                                        }}
                                                        onCancel={() => setModalAddAddressOpen(false)}>
                                                        <form action="#" className="pt-3 border-t grid  gap-6">

                                                            <div>
                                                                <div className="grid grid-cols-2 gap-6 justify-between">
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                setInfoOrder({ ...infoOrder, fullName: e.target.value })
                                                                            }
                                                                            defaultValue=""
                                                                            type="text"
                                                                            name="name"
                                                                            placeholder="Tên người nhận"
                                                                            className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                setInfoOrder({
                                                                                    ...infoOrder,
                                                                                    phoneNumber: Number(e.target.value),
                                                                                })
                                                                            }
                                                                            defaultValue=""
                                                                            max={10}
                                                                            type="number"
                                                                            name="phoneNumber"
                                                                            placeholder="Số điện thoại"
                                                                            className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setInfoOrder({ ...infoOrder, email: e.target.value })
                                                                    }
                                                                    defaultValue=""
                                                                    type="email"
                                                                    name="email"
                                                                    placeholder="Email"
                                                                    className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between flex-wrap gap-2">
                                                                    <Select
                                                                        defaultValue="Tỉnh/Thành Phố"
                                                                        className="w-[30%] max-sm:w-[48%]"
                                                                        onChange={(value, option) => setSelectedCity({ label: option.label, value: value })}
                                                                        options={citys}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />

                                                                    <Select
                                                                        defaultValue="Quận/Huyện/Thị xã"
                                                                        className="w-[30%] max-sm:w-[48%]"
                                                                        onChange={(value, option) => setSelectedDistrict({ label: option.label, value: value })}
                                                                        options={districts}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />

                                                                    <Select
                                                                        defaultValue="Xã/Phường/Thị trấn"
                                                                        className="w-[30%] max-sm:w-[48%]"

                                                                        onChange={(value, option) => setSelectedWard({ label: option.label, value: value })}
                                                                        options={wards}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setInfoOrder({
                                                                            ...infoOrder,
                                                                            street: e.target.value,
                                                                        })
                                                                    }
                                                                    type="text"
                                                                    name="address1"
                                                                    placeholder="Số nhà, đường, ..."
                                                                    className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                />
                                                            </div>


                                                            <div>
                                                                <Checkbox onChange={(e) => {
                                                                    setDefaultAddress(e.target.checked)
                                                                }}>Đặt làm địa chỉ mặc định</Checkbox>
                                                            </div>
                                                        </form>
                                                    </Modal>

                                                    {/* Modal cập nhật địa chỉ */}
                                                    <Modal
                                                        className="flex"
                                                        title="Thay đổi địa chỉ"
                                                        centered
                                                        open={modalUpdateAddressOpen}
                                                        onOk={() => {
                                                            handleUpdateAddress()
                                                            setModalUpdateAddressOpen(false)
                                                        }}
                                                        onCancel={() => setModalUpdateAddressOpen(false)}>
                                                        <form action="#" className="pt-3 border-t grid  gap-6">

                                                            <div>
                                                                <div className="grid grid-cols-2 gap-6 justify-between">
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                setAddressUpdate({ ...addressUpdate, fullName: e.target.value })
                                                                            }
                                                                            value={addressUpdate?.fullName}
                                                                            type="text"
                                                                            name="name"
                                                                            placeholder="Tên người nhận"
                                                                            className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                setAddressUpdate({
                                                                                    ...addressUpdate,
                                                                                    phoneNumber: Number(e.target.value),
                                                                                })
                                                                            }
                                                                            defaultValue={addressUpdate?.phoneNumber}
                                                                            max={10}
                                                                            type="number"
                                                                            name="phoneNumber"
                                                                            placeholder="Số điện thoại"
                                                                            className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setAddressUpdate({ ...addressUpdate, email: e.target.value })
                                                                    }
                                                                    defaultValue={addressUpdate?.email}
                                                                    type="email"
                                                                    name="email"
                                                                    placeholder="Email"
                                                                    className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between flex-wrap gap-2">
                                                                    <Select
                                                                        value={addressUpdate?.city?.label}
                                                                        className="w-[30%] max-sm:w-[48%]"
                                                                        // onChange={(value, option) => setSelectedCity({ label: option.label, value: value })}
                                                                        onChange={(value, option) => {
                                                                            setSelectedCity({ label: option.label, value: value })
                                                                            setAddressUpdate({ ...addressUpdate, city: { label: option.label, value: value } })
                                                                        }}
                                                                        options={citys}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />

                                                                    <Select
                                                                        value={addressUpdate?.district?.label}
                                                                        className="w-[30%] max-sm:w-[48%]"
                                                                        // onChange={(value, option) => setSelectedDistrict({ label: option.label, value: value })}
                                                                        onChange={(value, option) => {
                                                                            setSelectedDistrict({ label: option.label, value: value })
                                                                            setAddressUpdate({ ...addressUpdate, district: { label: option.label, value: value } })
                                                                        }}
                                                                        options={districts}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />

                                                                    <Select
                                                                        value={addressUpdate?.ward?.label}
                                                                        className="w-[30%] max-sm:w-[48%]"

                                                                        // onChange={(value, option) => setSelectedWard({ label: option.label, value: value })}
                                                                        onChange={(value, option) => {
                                                                            setSelectedWard({ label: option.label, value: value })
                                                                            setAddressUpdate({ ...addressUpdate, ward: { label: option.label, value: value } })
                                                                        }}
                                                                        options={wards}
                                                                        showSearch
                                                                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                        filterSort={(optionA, optionB) =>
                                                                            (optionA?.label.toLowerCase() ?? '').localeCompare(optionB?.label.toLowerCase())
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setAddressUpdate({
                                                                            ...addressUpdate,
                                                                            street: e.target.value,
                                                                        })
                                                                    }
                                                                    defaultValue={addressUpdate?.street}
                                                                    type="text"
                                                                    name="address1"
                                                                    placeholder="Số nhà, đường, ..."
                                                                    className="mt-1 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                                                />
                                                            </div>


                                                            <div>
                                                                <Checkbox value={addressUpdate?.default} onChange={(e) => {
                                                                    setAddressUpdate({ ...addressUpdate, default: e.target.checked })
                                                                }}>Đặt làm địa chỉ mặc định</Checkbox>
                                                            </div>
                                                        </form>
                                                    </Modal>

                                                </Modal>

                                            </div>
                                        </div>
                                        {/* <form action="#" className="pt-3 border-t grid  gap-6">

                                        {/* Ngoài */}
                                        {
                                            checkedAddress && <div className="leading-8">
                                                <div>
                                                    <div className="text-base font-medium">
                                                        <span className="pr-2 border-r-2">{checkedAddress?.fullName}</span>
                                                        <span className="pl-2">(+84) {checkedAddress?.phoneNumber}</span>
                                                        <p>Email: {checkedAddress?.email}</p>
                                                    </div>
                                                    <div>Số nhà/đường: {checkedAddress?.street}, {checkedAddress?.ward?.label}, {checkedAddress?.district?.label}, {checkedAddress?.city?.label}</div>
                                                </div>
                                            </div>
                                        }

                                        <div>
                                            <textarea
                                                onChange={(e) =>
                                                    setCheckedAddress({
                                                        ...checkedAddress,
                                                        message: e.target.value,
                                                    })
                                                }
                                                // type="text"
                                                name="message"
                                                placeholder="Ghi chú cho đơn hàng ..."
                                                className="mt-2 w-full focus:outline-blue-200 rounded-md px-2 py-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                </div>
                                <div className="cursor-pointer select-none w-full mx-auto rounded-lg bg-white shadow-sm border font-light">
                                    <p className=" font-medium m-2 pb-2 border-b">Phương thức thanh toán</p>
                                    <ul className="w-full text-sm font-medium text-gray-900 bg-white rounded-lg">
                                        <li className=" border-b mx-2 border-gray-200 border-x-none rounded-t-lg">
                                            <div className="flex items-center radio-button ps-3">
                                                <input
                                                    id="payoff"
                                                    type="radio"
                                                    name="payment"
                                                    value={'payoff'}
                                                    onChange={(event) => setSelectedPayment(event.target.value)}
                                                    defaultChecked
                                                    className="radio-button__input"
                                                />
                                                <label
                                                    htmlFor="payoff"
                                                    className=" py-2 ms-2 radio-button__label"
                                                >
                                                    <span className="radio-button__custom"></span>

                                                    Thanh toán khi nhận hàng{" "}
                                                </label>
                                            </div>
                                        </li>
                                        <li className=" mx-2 rounded-t-lg">
                                            <div className="flex items-center ps-3">
                                                <input
                                                    id="vnpay"
                                                    type="radio"
                                                    name="payment"
                                                    value={'vnpay'}
                                                    onChange={(event) => setSelectedPayment(event.target.value)}
                                                    className="radio-button__input"
                                                />
                                                <label
                                                    htmlFor="vnpay"
                                                    className=" py-3 ms-2 radio-button__label "
                                                >
                                                    <span className="radio-button__custom"></span>
                                                    {" "}
                                                    <img alt="" src="./images/vnpay.png" className="h-6 ml-3" />
                                                </label>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex items-stretch gap-x-[5px] mt-3">
                                    <input id="emailOrder" type="checkbox" checked={statusCheckedEmailOrder} onChange={() => setStatusCheckedEmailOrder(!statusCheckedEmailOrder)} />
                                    <label htmlFor="emailOrder" className="text-sm mt-2 select-none cursor-pointer">Nhận email xác nhận</label>
                                </div>

                                <div>
                                    <button disabled={disabled}
                                        onClick={addToOrder}
                                        className="block w-full my-4 max-w-xs mx-auto bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold"
                                    >
                                        {
                                            disabled ?
                                                <span>Loading...</span>
                                                : <span>
                                                    <i className="mdi mdi-lock-outline mr-1"></i> ĐẶT HÀNG
                                                </span>
                                        }

                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* voucher */}
            <Modal
                title="Chọn mã giảm giá"
                open={isModalOpen[0]}
                onOk={() => toggleModal(0, false)}
                onCancel={() => toggleModal(0, false)}
                footer=""
                width={600}
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
                                        placeholder="Nhập mã giảm giá"
                                        readOnly
                                        defaultValue={selectedVoucher?.code}
                                        type="search"
                                        id="default-search"
                                        className="block p-2.5 pl-2 w-full text-sm text-gray-900 bg-gray-50 rounded-lg  -gray-300 focus:ring-blue-500 focus:-blue-500 "
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
                                        // console.log(userVoucher)
                                        return (
                                            <label
                                                key={i}
                                                htmlFor={`voucher-${i}`}
                                                className="flex w-full border mt-3 shadow cursor-pointer"
                                            >
                                                <svg
                                                    width="25%"
                                                    height="25%"
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
        </>
    );
};

export default Checkout;