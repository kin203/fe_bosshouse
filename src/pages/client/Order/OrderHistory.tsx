import { Button, Modal as ModalReview, Flex, Rate, Upload, Image } from "antd";
import type { UploadFile, UploadProps } from 'antd';
// type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
import { PlusOutlined } from '@ant-design/icons';

import { useEffect, useState } from "react";
import { updateOrder } from "../../../services/order";
import moment from "moment";
import { formatCurrency } from "../../../utils/products";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addReview,
  findReview,
  getReviewsNoNavigate,
} from "../../../services/review";
import { useGetOrderByUserId } from "../../../hooks/apis/order";
import { addSoldProduct } from "../../../services/soldProduct";
import { addNotification } from "../../../services/notification";
import { useAddCart, useAddCartPayNow } from "../../../hooks/apis/carts";
import { useDispatch, useSelector } from "react-redux";
import { setListProductCartSelected } from "../../../redux/slices/listProductCartSelected";
import { setRepuchaseListProductChecked } from "../../../redux/slices/Cart";
import { getProduct } from "../../../services/products";
import { vnPayRefund } from "../../../services/vnpay";
import order from "../../../redux/slices/order";
import { setReload } from "../../../redux/slices/Reload";
import { addCart } from "../../../services/cart";
import { useQueryClient } from "@tanstack/react-query";

const OrderHistory = () => {
  const [openTab, setOpenTab] = useState(1);
  const [tab, setTab] = useState(1);
  const next = useNavigate()
  const [cartUser, setCartUser] = useState(null);
  const idUserSession = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))?._id
    : undefined;
  const userSession = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : undefined;
  const { data } = useGetOrderByUserId({ userId: idUserSession });
  // console.log(data?.data)

  //reload
  const reload = useSelector((state: { reload: any }) => state.reload);
  useEffect(() => {
    console.log(reload);
    // When the component mounts, check if "reload" is true
    // If it is, set it to false and reload the page
    if (reload) {
      window.location.reload();
      dispatch(setReload(false));
    }
  }, [reload]);
  //

  useEffect(() => {
    setCartUser(data?.data);
  }, [data, data?.data?.status]);

  useEffect(() => {
    if (!userSession) {
      next("/signin")
    }
  }, [userSession]);

  const [open, setOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    _id: "",
    orderCode: "",
    fullName: "",
    phoneNumber: 0,
    address: "",
    message: "",
    products: [],
    createdAt: "",
    paymentMethod: "",
    status: "",
    transportFee: 0,
    email: "",
    salePrice: 0
  });
  // console.log(cartUser)

  // Quá 3 ngày ko ấn đã nhận hàng thì cập nhật sang đã nhận hàng
  useEffect(() => {
    const updateDeliveredOrders = async () => {
      if (!cartUser) return;

      const ordersToUpdate = cartUser.filter(order => {
        return order?.products[0].status == "Giao Hàng Thành Công" && moment(order.updatedAt).isBefore(moment().subtract(3, 'days'));
      });

      // Iterate through the filtered orders and update them
      for (const order of ordersToUpdate) {
        try {
          // Tạo mảng các promise từ hàm addSoldProduct
          const promises = order?.products?.map((i) => {
            return addSoldProduct({
              productId: i?.productId,
              quantity: i?.selectedQuantity,
            });
          });
          // Chờ tất cả các promise hoàn thành, cập nhật sản phẩm đã bán
          await Promise.all(promises);



          // Update order status to "Đã Nhận Hàng"
          await updateOrder({
            orderId: order._id,
            status: "Đã Nhận Hàng"
          });

          // Update local state
          const updatedOrders = cartUser.map(cartOrder => {
            if (cartOrder._id == order._id) {
              return { ...cartOrder, status: "Đã Nhận Hàng" };
            }
            return cartOrder;
          });

          setCartUser(updatedOrders);
        } catch (error) {
          console.error(`Error updating order ${order._id}:`, error);
        }
      }
    };

    updateDeliveredOrders();
  }, [cartUser]);

  const handleOpen = (item: any) => {
    // console.log(item);
    setModalInfo(item);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

 
  const orderConfirm = async (item) => {
    Swal.fire({
      title: "Xác nhận đã nhận hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ok",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Tạo mảng các promise từ hàm addSoldProduct
          const promises = item?.products?.map((i) => {
            return addSoldProduct({
              productId: i?.productId,
              quantity: i?.selectedQuantity
            });
          });
          // Chờ tất cả các promise hoàn thành, cập nhật sản phẩm đã bán
          await Promise.all(promises);

          // cập nhật status order
          await updateOrder({
            orderId: item?._id,
            status: "Đã Nhận Hàng",
          });

          // Cập nhật lại state users
          const updatedOrders = cartUser.map((order) => {
            if (order._id === item?._id) {
              const updatedProducts = order.products.map((product) => {
                return { ...product, status: "Đã Nhận Hàng" };
              });
              return { ...order, products: updatedProducts };
            }
            return order;
          });
          setCartUser(updatedOrders);

          

          // Thông báo tới admin
          await addNotification({
            to: "admin",
            username: userSession.username,
            userId: userSession?._id,
            title: `${userSession.username} đã xác nhận đơn hàng ${item?._id}`,
            content: `Đơn hàng được xác nhận vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
          })

          Swal.fire({
            title: "Xác nhận đơn hàng thành công!",
            icon: "success",
          })
          

        } catch (error) {
          Swal.fire({
            title: error?.response?.data?.error,
            icon: "error",
          });
          console.log(error);
        }
      }
    });
  };

  const refundProduct = (id) => {
    Swal.fire({
      title: "Xác nhận trả hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ok",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(id);
          await updateOrder({
            orderId: id,
            status: "Yêu Cầu Trả Hàng Hoàn Tiền",
          });

          // Cập nhật lại danh sách đơn hàng sau khi cập nhật trạng thái đơn hàng
          const updatedOrders = cartUser.map((order) => {
            if (order._id === id) {
              const updatedProducts = order.products.map((product) => {
                return { ...product, status: "Yêu Cầu Trả Hàng Hoàn Tiền" };
              });
              return { ...order, products: updatedProducts };
            }
            return order;
          });
          setCartUser(updatedOrders);

          // Thông báo tới admin
          await addNotification({
            to: "admin",
            username: userSession.username,
            userId: userSession?._id,
            title: `${userSession.username} đã yêu cầu trả hàng, mã đơn hàng: ${id}`,
            content: `Đơn trả hàng được yêu cầu vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
          })

          Swal.fire({
            title: "Đã gửi yêu cầu trả hàng!",
            icon: "success",
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  const cancelRefundProduct = (id) => {
    Swal.fire({
      title: "Xác nhận hủy trả hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hủy",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(id);
          await updateOrder({
            orderId: id,
            status: "Giao Hàng Thành Công",
          });

          // Cập nhật lại danh sách đơn hàng sau khi cập nhật trạng thái đơn hàng
          const updatedOrders = cartUser.map((order) => {
            if (order._id === id) {
              const updatedProducts = order.products.map((product) => {
                return { ...product, status: "Giao Hàng Thành Công" };
              });
              return { ...order, products: updatedProducts };
            }
            return order;
          });
          setCartUser(updatedOrders);

          // Thông báo tới admin
          await addNotification({
            to: "admin",
            username: userSession.username,
            userId: userSession?._id,
            title: `${userSession.username} đã hủy yêu cầu trả hàng, mã đơn hàng: ${id}`,
            content: `Đơn trả hàng được hủy yêu cầu vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
          })

          Swal.fire({
            title: "Đã hủy yêu cầu trả hàng!",
            icon: "success",
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  // Hoàn tiền
  const refundMoney = (item) => {
    // console.log(item)

    Swal.fire({
      title: "Xác nhận hoàn tiền?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ok",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await vnPayRefund({
            orderId: item?._id,
            amount: item.totalPrice - 1000,
            transType: "03",
            user: userSession._id
          });
          // console.log(res)

          Swal.fire({
            title: 'Đã gửi yêu cầu hoàn tiền!',
            text: `Mã đơn hàng: ${item?.orderCode}.`,
            icon: 'success'
          });

          // console.log(id);
          await updateOrder({
            orderId: item?._id,
            status: "Hoàn Tiền",
          });

          // // Cập nhật lại danh sách đơn hàng sau khi cập nhật trạng thái đơn hàng
          const updatedOrders = cartUser.map((order) => {
            if (order._id === item?._id) {
              const updatedProducts = order.products.map((product) => {
                return { ...product, status: "Hoàn Tiền" };
              });
              return { ...order, products: updatedProducts };
            }
            return order;
          });
          setCartUser(updatedOrders);

          // // Thông báo tới admin
          await addNotification({
            to: "admin",
            username: userSession.username,
            userId: userSession?._id,
            title: `${userSession.username} đã yêu cầu hoàn tiền, mã đơn hàng: ${item?._id}`,
            content: `Đơn hoàn tiền được yêu cầu vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
          })
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  const exportToPDF = () => {
    const input = document.getElementById("pdf-content");

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`order_bosshouse.pdf`);
    });
  };

  useEffect(() => {
    document.title = "Đơn hàng của bạn";
    window.scrollTo(0, 0);
  }, []);

  // Modal Review
  const [isModalOpenReview, setIsModalOpenReview] = useState(false);
  const desc = ["Không hài lòng", "Tạm được", "Trung bình", "Tốt", "Rất tốt"];
  const [valueRate, setValueRate] = useState(5);
  const [comment, setComment] = useState(null);
  const [itemP, setItemP] = useState(null);
  const [reviews, setReviews] = useState(null);

  // start upload image
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  // console.log(fileList.reduce((a, b) => a?.concat(b?.response?.urls[0]), []));

  const getBase64 = (file): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as any);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as any);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  // end upload

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getReviewsNoNavigate();
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const showModalReview = (item) => {
    setIsModalOpenReview(true);
    setItemP(item);
  };

  const handleOkReview = () => {
    setIsModalOpenReview(false);
  };

  const handleCancelReview = () => {
    setIsModalOpenReview(false);
  };


  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Tạo một đối tượng để lưu trữ productId đã được đánh giá
    const reviewedProducts = {};

    for (let i = 0; i < itemP?.products.length; i++) {
      const product = itemP?.products[i];
      const productId = product.productId;

      // Kiểm tra xem productId đã được đánh giá chưa
      if (!reviewedProducts[productId]) {
        const dataReview = {
          productId: productId,
          userId: idUserSession,
          rating: valueRate,
          comment,
          selectedSize: product.selectedSize,
          selectedQuantity: product.selectedQuantity,
          images: fileList.reduce((a, b) => a?.concat(b?.response?.urls[0]), []) || [],
          orderId: itemP._id
        };

        try {
          const res = await addReview(dataReview);
          // console.log(res);

          // Thông báo tới admin
          await addNotification({
            to: "admin",
            username: userSession.username,
            userId: userSession?._id,
            title: `${userSession.username} đã gửi 1 đánh giá`,
            content: `Đơn hàng được tạo vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
          })

          // Đánh dấu productId đã được đánh giá
          reviewedProducts[productId] = true;
        } catch (error) {
          console.log(error);
        }
      }
    }

    Swal.fire({
      title: "Cảm ơn bạn đã phản hồi!",
      icon: "success",
    });

    // Reset state valueRate and comment
    setValueRate(5);
    setComment(null);

    // Fetch reviews again
    const updatedReviews = await getReviewsNoNavigate();
    setReviews(updatedReviews.data);

    setIsModalOpenReview(false);
  };


  // Modal View Review
  const [isModalOpenViewReview, setIsModalOpenViewReview] = useState(false);
  const [viewReview, setViewReview] = useState(null);
  const handleViewReview = async (item) => {
    // console.log(item)
    const dataF = {
      productId: item?.products[0].productId,
      userId: idUserSession,
      selectedSize: item?.products[0]?.selectedSize,
      selectedQuantity: item?.products[0]?.selectedQuantity,
    };

    try {
      const res = await findReview(dataF);
      // console.log(res.data)
      setViewReview(res.data);
      setIsModalOpenViewReview(true);
    } catch (error) {
      console.log(error);
    }
  };

  const showModaViewlReview = (item) => {
    setIsModalOpenViewReview(true);
  };

  const handleOkViewReview = () => {
    setIsModalOpenViewReview(false);
  };

  const handleCancelViewReview = () => {
    setIsModalOpenViewReview(false);
  };

  useEffect(() => {
    if (tab == 1) {
      setCartUser(data?.data)
    } else if (tab == 2) {
      setCartUser(data?.data?.filter(
        (item) =>
          item.products[0]?.status === "Chờ Xác Nhận"
        //  || item.products[0]?.status === "Đã Xác Nhận"
      ))
    } else if (tab == 3) {
      setCartUser(data?.data?.filter(
        // (item) => item.products[0]?.status === "Đã Xác Nhận Thanh Toán"
        (item) => item.products[0]?.status === "Đã Xác Nhận"
      ))
    } else if (tab == 4) {
      setCartUser(data?.data?.filter(
        (item) => item.products[0]?.status === "Đang Giao Hàng" || item.products[0]?.status === "Giao Hàng Thành Công"
      ))
    } else if (tab == 5) {
      setCartUser(data?.data?.filter(
        (item) =>
          item.products[0]?.status === "Đã Nhận Hàng"
      ))
    } else if (tab == 6) {
      setCartUser(data?.data?.filter(
        (item) => item.products[0]?.status === "Hủy Đơn Hàng" || item.products[0]?.status === "Xác Nhận Hủy Đơn Hàng"
      ))
    } else if (tab == 7) {
      setCartUser(data?.data?.filter(
        (item) => item.products[0]?.status === "Yêu Cầu Trả Hàng Hoàn Tiền" ||
          item.products[0]?.status === "Xác Nhận Trả Hàng Hoàn Tiền"))
    }
  }, [data, tab]);

  const [isModalOpenHuyDon, setIsModalOpenHuyDon] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [dataReason, setDataReason] = useState(null);

  const showModalHuyDon = (item) => {
    setIsModalOpenHuyDon(true);
    setDataReason(item);
  };
  // console.log(dataReason)

  const handleOkHuyDon = async () => {
    setIsModalOpenHuyDon(false);
    // console.log(reason)
    // console.log(dataReason)

    await updateOrder({
      orderId: dataReason?._id,
      status: "Yêu Cầu Hủy Đơn Hàng",
      reason: reason,
      data: dataReason?.products,
    });
    setReason("")

    // Tìm và cập nhật trạng thái của đơn hàng trong cartUser
    const updatedCartUser = cartUser.map((order) => {
      if (order._id == dataReason?._id) {
        return {
          ...order,
          products: order?.products?.map((product) => {
            return {
              ...product,
              status: "Yêu Cầu Hủy Đơn Hàng",
            };
          }),
        };
      }
      return order;
    });
    // Cập nhật lại cartUser với trạng thái mới
    setCartUser(updatedCartUser);

    // Thông báo tới admin
    await addNotification({
      to: "admin",
      username: userSession.username,
      userId: userSession?._id,
      title: `${userSession.username} đã yêu cầu hủy đơn hàng, mã đơn hàng: ${dataReason?._id}`,
      content: `Đơn bị hủy vào ${moment(new Date()).format("DD/MM/YYYY HH:mm")}`,
    })

    Swal.fire({
      title: "Đã yêu cầu hủy đơn hàng!",
      icon: "success",
    });
  };

  const handleCancelHuyDon = () => {
    setIsModalOpenHuyDon(false);
  };

  // Mua lại
  const { mutateAsync } = useAddCartPayNow()
  const dispatch = useDispatch()

  const handleRepurchase = async (item) => {
    // console.log(item)
    const dataListProductSelected = await Promise.all(item.map(async (item) => {
      const product = await getProduct(item?.productId);

      return {
        product: { _id: item?.productId, ...product?.data },
        selectedSize: item?.selectedSize,
        selectedQuantity: item?.selectedQuantity
      };
    }));
    // console.log(dataListProductSelected)
    if (dataListProductSelected?.length === 0) return
    dispatch(setRepuchaseListProductChecked(dataListProductSelected))

    const newArrDataAddToCart = item?.map(item => {
      return {
        _id: item?.productId,
        _userId: idUserSession,
        selectedSize: item?.selectedSize,
        selectedQuantity: item?.selectedQuantity
      }
    })

    for (let i = 0; i < newArrDataAddToCart.length; i++) {
      await mutateAsync(newArrDataAddToCart[i])
    }

    // const promises = newArrDataAddToCart.map(async(item) => await addCart(item));
    // await Promise.all(promises);

    next('/cart');
  }

  return (
    <div className="bg-[#f5f5f5] xl:pt-4 pt-10">
      <h1 className=" text-center text-gray-800 text-3xl font-bold py-6">
        Đơn Hàng
      </h1>
      <section className=" font-sans flex h-auto  w-full items-center justify-center ">
        <div className="w-full mx-28">
          <div className="mb-4 flex lg:space-x-3 px-3 space-x-6  p-2 rounded-lg shadow-sm overflow-x-auto">
            <button
              onClick={() => {
                setOpenTab(1)
                setTab(1)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 1
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Tất cả{" "}
              <sup className="bg-[red] text-white px-1.5 py-0 rounded-[100%]">
                {data?.data?.length || 0}
              </sup>
            </button>
            <button
              onClick={() => {
                setOpenTab(2)
                setTab(2)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 2
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Chờ thanh toán{" "}
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status === "Chờ Xác Nhận")?.length ?

                  (<sup className="bg-[red] text-white px-1 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status === "Chờ Xác Nhận")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
            <button
              onClick={() => {
                setOpenTab(3)
                setTab(3)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 3
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Chờ giao hàng
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status === "Đã Xác Nhận")?.length ?

                  (<sup className="bg-[red] text-white px-1 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status === "Đã Xác Nhận")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
            <button
              onClick={() => {
                setOpenTab(4)
                setTab(4)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 4
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Vận chuyển
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status === "Đang Giao Hàng" || i.products?.[0]?.status === "Giao Hàng Thành Công")?.length ?

                  (<sup className="bg-[red] text-white px-1.5 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status === "Đang Giao Hàng" || i.products?.[0]?.status === "Giao Hàng Thành Công")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
            <button
              onClick={() => {
                setOpenTab(5)
                setTab(5)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 5
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Hoàn thành
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status == "Đã Nhận Hàng")?.length ?

                  (<sup className="bg-[red] text-white px-1.5 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status == "Đã Nhận Hàng")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
            <button
              onClick={() => {
                setOpenTab(6)
                setTab(6)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 6
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Đã hủy
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status === "Hủy Đơn Hàng" || i.products?.[0]?.status === "Xác Nhận Hủy Đơn Hàng")?.length ?

                  (<sup className="bg-[red] text-white px-1.5 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status === "Hủy Đơn Hàng" || i.products?.[0]?.status === "Xác Nhận Hủy Đơn Hàng")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
            <button
              onClick={() => {
                setOpenTab(7)
                setTab(7)
              }}
              className={`xl:flex-1 flex-none  text-base font-medium xl:py-2 xl:px-1 rounded-md focus:outline-none focus:shadow-outline-blue transition-all duration-300 ${openTab === 7
                ? "text-[red] underline-offset-[20px] underline-x-4 underline"
                : ""
                }`}
            >
              Hoàn tiền
              <span>
                {data?.data?.filter(i => i.products?.[0]?.status === "Yêu Cầu Trả Hàng Hoàn Tiền" || i.products?.[0]?.status === "Xác Nhận Trả Hàng Hoàn Tiền")?.length ?

                  (<sup className="bg-[red] text-white px-1.5 py-0 rounded-[100%]">
                    {data?.data?.filter(i => i.products?.[0]?.status === "Yêu Cầu Trả Hàng Hoàn Tiền" || i.products?.[0]?.status === "Xác Nhận Trả Hàng Hoàn Tiền")?.length}
                  </sup>)
                  : undefined}
              </span>
            </button>
          </div>

          <div>
            {cartUser?.length > 0 ? (
              <div className="transition-all duration-300  rounded-lg shadow-md  ">
                {cartUser && cartUser.length > 0
                  ? cartUser
                    ?.sort((a, b) => {
                      // Chuyển đổi createdAt thành số nếu nó không phải là số
                      const createdAtA =
                        typeof a.createdAt === "number"
                          ? a.createdAt
                          : new Date(a.createdAt).getTime();
                      const createdAtB =
                        typeof b.createdAt === "number"
                          ? b.createdAt
                          : new Date(b.createdAt).getTime();
                      return createdAtB - createdAtA;
                    })
                    ?.map((item, i) => {
                      // console.log(item)
                      return (
                        <div key={i} className=" mb-4 bg-white p-3">
                          <div
                            key={i}
                            className="flex justify-between items-center mb-2 xl:text-sm text-xs"
                          >
                            <h2 className=" font-semibold text-left">
                              Mã đơn hàng: {item?.orderCode}
                            </h2>
                            <span className="text-[#26aa99] text-right">
                              Thời gian đặt hàng:
                              {moment(item?.createdAt).format(
                                "HH:mm - DD/MM/YYYY"
                              )}{" "}
                              |{" "}
                              <span className="text-red-500">
                                {item?.products[0]?.status.toUpperCase()}
                              </span>{" "}
                            </span>
                          </div>
                          {item?.products?.map((itemProduct, i) => {
                            // console.log(itemProduct)
                            return (
                              <div
                                key={i}
                                className="flex gap-3 my-1 justify-between border-b pb-1"
                              >
                                <div className="flex flex-row xl:gap-6 gap-2 items-center">
                                  <div className="xl:w-28 xl:h-24 w-14 h-14 bg-[green]">
                                    <Link to={`/products/detail/${itemProduct?.productId || itemProduct?._id}`}>
                                      <img
                                        alt="product"
                                        className="w-full h-full"
                                        src={itemProduct?.imageProduct || itemProduct?.initImageProduct}
                                      />
                                    </Link>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <p className="xl:text-lg text-sm font-semibold">
                                      {itemProduct?.name || itemProduct?.initNameProduct}
                                    </p>
                                    <p className="xl:text-sm text-xs text-gray-600 font-semibold">
                                      Phân loại:{" "}
                                      <span className="font-normal">
                                        {itemProduct?.selectedSize}
                                      </span>
                                    </p>
                                    <p className="xl:text-sm text-xs  font-semibold">
                                      x
                                      <span className="font-normal">
                                        {itemProduct?.selectedQuantity}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="self-center text-center">
                                  <p className="font-normal xl:text-base text-sm text-[red]">
                                    {
                                      // formatCurrency(
                                      //   itemProduct?.sizes?.find(s => s.size == itemProduct?.selectedSize)?.price *
                                      //   itemProduct?.selectedQuantity
                                      // ) || 

                                      // item?.salePrice == 0 ?
                                      formatCurrency(itemProduct?.initPriceProduct)
                                      // :
                                      // <>
                                      //   {formatCurrency(itemProduct?.initPriceProduct - item?.salePrice)}
                                      //   <span className="text-blue-500 text-sm"> (-{formatCurrency(item?.salePrice)})</span>
                                      // </>
                                    }
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div className="">
                            <div className="flex xl:justify-between justify-end space-x-3 border-gray-100 xl:py-4 py-2 xl:text-lg text-base font-medium">
                              <div className="text-sm font-normal my-1 xl:block hidden">
                                Phương thức thanh toán:{" "}
                                {item?.products[0]?.paymentMethod}
                                <div>
                                  {item?.products[0]?.status ==
                                    "Yêu Cầu Trả Hàng Hoàn Tiền" && (
                                      <span>
                                        {" "}
                                        Vui lòng đợi phản hồi từ người bán.
                                      </span>
                                    )}
                                  {item?.products[0]?.status ==
                                    "Xác Nhận Trả Hàng Hoàn Tiền" && (
                                      <span>
                                        Yêu cầu trả hàng đã được xác nhận, vui
                                        lòng đợi 1 - 7 ngày để được hoàn tiền.
                                      </span>
                                    )}
                                </div>
                              </div>

                              <div>
                                <div className="flex py-2 text-base">
                                  <div className="font-[400]">Tổng tiền hàng: </div>
                                  <div className=" ml-2">
                                    <span>
                                      {formatCurrency(item?.products.reduce((a, b) => a += b.initPriceProduct * b.selectedQuantity, 0))}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex py-2 text-base">
                                  <div className="font-[300]">Giảm giá: </div>
                                  <div className=" ml-2">
                                    <span>
                                      - {formatCurrency(item?.salePrice)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex py-2 text-base">
                                  <div className="font-[400]">Phí vận chuyển: </div>
                                  <div className=" ml-2">
                                    <span>
                                      {formatCurrency(item?.transportFee)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex  xl:py-2 xl:text-base text-sm">
                                  <div>Thành tiền: </div>
                                  <div className="text-red-600 ml-2">
                                    <span>
                                      {formatCurrency(item?.totalPrice)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <div className="xl:block hidden w-[40%] text-sm">
                                <span>
                                  Vui lòng chỉ nhấn "Đã nhận được hàng" khi
                                  đơn hàng đã được giao đến bạn và sản phẩm
                                  nhận được không có vấn đề nào.
                                </span>
                              </div>
                              <div className="xl:hidden block w-[45%] text-sm">
                                Phương thức thanh toán:{" "}
                                {item?.products[0]?.paymentMethod}
                                <div>
                                  {item?.products[0]?.status ==
                                    "Yêu Cầu Trả Hàng Hoàn Tiền" && (
                                      <span>
                                        {" "}
                                        Vui lòng đợi phản hồi từ người bán.
                                      </span>
                                    )}
                                  {item?.products[0]?.status ==
                                    "Xác Nhận Trả Hàng Hoàn Tiền" && (
                                      <span>
                                        Yêu cầu trả hàng đã được xác nhận, vui
                                        lòng đợi 1 - 7 ngày để được hoàn tiền.
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="text-right">
                                {item?.products[0]?.status ===
                                  "Chờ Xác Nhận" && (
                                    <Button
                                      // onClick={() => handleDelete(item)}
                                      onClick={() => showModalHuyDon(item)}
                                      type="dashed"
                                      className="text-red-500 hover:underline m-1"
                                    >
                                      Hủy đơn hàng
                                    </Button>
                                  )}

                                {/* // Hiển thị nút "Đánh giá" dựa trên việc một đánh giá đã được gửi hay chưa */}
                                {item?.products[0]?.status ===
                                  "Đã Nhận Hàng" &&
                                  !reviews?.find(
                                    (i) =>
                                      item?.products?.find(order => order.productId == i.productId && order.selectedSize == i.selectedSize && order.selectedQuantity == i.selectedQuantity)
                                      &&
                                      i.userId == item?.userId
                                  ) && (
                                    <>
                                      <Button
                                        onClick={() => showModalReview(item)}
                                        type="dashed"
                                        className="text-blue-500 hover:underline m-1"
                                      >
                                        Đánh giá
                                      </Button>

                                      <Button onClick={() => handleRepurchase(item?.products)}
                                        type="dashed"
                                        className="text-[red] hover:underline m-1"
                                      >
                                        Mua Lại
                                      </Button>

                                    </>
                                  )}

                                {/* // Hiển thị nút "Xem đánh giá" nếu một đánh giá đã được gửi */}
                                {reviews?.find(
                                  (i) =>
                                    item?.products?.find(order => order.productId == i.productId && order.selectedSize == i.selectedSize && order.selectedQuantity == i.selectedQuantity)
                                    && i.userId == item?.userId && item?._id == i.orderId
                                ) && (
                                    <>
                                      <Button
                                        onClick={() => handleViewReview(item)}
                                        type="dashed"
                                        className="text-blue-500 hover:underline m-1"
                                      >
                                        Xem đánh giá
                                      </Button>

                                      <Button onClick={() => handleRepurchase(item?.products)}
                                        type="dashed"
                                        className="text-[red] hover:underline m-1"
                                      >
                                        Mua Lại
                                      </Button>
                                    </>
                                  )}

                                {/* Đã Nhận Hàng */}
                                {item?.products[0]?.status ===
                                  "Giao Hàng Thành Công" ? (
                                  <Button
                                    onClick={() => orderConfirm(item)}
                                    type="dashed"
                                    className="text-blue-500 hover:underline m-1"
                                  >
                                    Đã nhận hàng
                                  </Button>
                                ) : undefined}

                                {/* Hoàn tiền */}
                                {item?.products[0]?.status ===
                                  "Chờ Xác Nhận Thanh Toán" &&
                                  item?.products[0]?.paymentMethod ==
                                  "Thanh toán qua VnPay" ? (
                                  <Button
                                    onClick={() => refundMoney(item)}
                                    type="dashed"
                                    className="text-blue-500 hover:underline m-1"
                                  >
                                    Hoàn tiền
                                  </Button>
                                ) : undefined}

                                {/* Trả hàng hoàn tiền */}
                                {item?.products[0]?.status ===
                                  "Giao Hàng Thành Công" &&
                                  item?.products[0]?.paymentMethod ==
                                  "Thanh toán qua VnPay" ? (
                                  <Button
                                    onClick={() => refundProduct(item?._id)}
                                    type="dashed"
                                    className="text-blue-500 hover:underline m-1"
                                  >
                                    Trả hàng - Hoàn tiền
                                  </Button>
                                ) : undefined}

                                {/* Hủy trả hàng hoàn tiền */}
                                {item?.products[0]?.status ===
                                  "Yêu Cầu Trả Hàng Hoàn Tiền" ? (
                                  <Button
                                    onClick={() =>
                                      cancelRefundProduct(item?._id)
                                    }
                                    type="dashed"
                                    className="text-blue-500 hover:underline m-1"
                                  >
                                    Hủy yêu cầu trả hàng
                                  </Button>
                                ) : undefined}

                                {/* Hóa Đơn */}
                                {item?.products[0]?.status !=
                                  "Chờ Xác Nhận" &&
                                  item?.products[0]?.status !=
                                  "Đã Xác Nhận" &&
                                  item?.products[0]?.status !=
                                  "Trả Hàng Hoàn Tiền" &&
                                  item?.products[0]?.status !=
                                  "Hủy Đơn Hàng" && item?.products[0]?.status != 'Yêu Cầu Hủy Đơn Hàng'
                                  && item?.products[0]?.status != "Xác Nhận Hủy Đơn Hàng"
                                  && item?.products[0]?.status != "Từ Chối Hủy Đơn Hàng" ? (
                                  <Button
                                    onClick={() => handleOpen(item)}
                                    type="dashed"
                                    className="text-blue-500 hover:underline m-1"
                                  >
                                    Hóa đơn
                                  </Button>
                                ) : undefined}

                                {item?.products[0]?.status ===
                                  "Xác Nhận Hủy Đơn Hàng" && (
                                    <>
                                      <Button onClick={() => handleRepurchase(item?.products)}
                                        type="dashed"
                                        className="text-[red] hover:underline m-1"
                                      >
                                        Mua Lại
                                      </Button>
                                    </>
                                  )}
                                {/* Sản phẩm tương tự */}
                                {/* <Link to="/products"><Button type="dashed" className="text-blue-500 hover:underline m-1">Sản phẩm tương tự</Button></Link> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : undefined}
              </div>
            ) : (
              <div className=" min-h-[70vh] xl:py-16 py-20 text-center">
                <img
                  className="mx-auto xl:w-48 w-40 "
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/orderlist/5fafbb923393b712b964.png"
                  alt="Đơn hàng trống"
                />
                <div className="font-medium mt-3 xl:text-xl text-base">
                  Chưa có đơn hàng
                </div>
              </div>
            )}
          </div>

        </div>

        <Modal
          open={open}
          style={{ textAlign: "center", overflowY: "scroll" }}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div className="h-auto bg-gray-200 text-gray-900  shadow-2xl">
              <div
                className="rounded-md relative px-5 py-5 bg-white min-h-[90vh]"
                id="pdf-content"
              >
                <div className="py-8 flex justify-between">
                  <div className="flex">
                    <img
                      src="/images/logo.png"
                      alt=""
                      className="w-[50px] h-[50px]"
                    />
                    <span className="font-semibold mt-[12px] ml-1">
                      BossHouse
                    </span>
                  </div>
                  <div>
                    <div className=" text-[12px] font-medium">
                      Hóa Đơn {modalInfo?.orderCode}
                    </div>
                    <div className="font-medium text-xs">
                      {" "}
                      {moment(modalInfo?.createdAt).format(
                        "[Ngày] DD [tháng] MM [năm] YYYY"
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center text-2xl font-bold my-4">
                  Hóa Đơn
                </div>
                <div className="text-sm pl-2 text-left font-medium">
                  <div className=" mb-1">
                    Tên khách hàng : {modalInfo?.fullName}
                  </div>
                  <div className=" mb-1">
                    Eamil : {modalInfo?.email}
                  </div>
                  <div className=" mb-1">
                    Số điện thoại: +84 {modalInfo?.phoneNumber}
                  </div>
                  <div>Địa chỉ khách hàng : {modalInfo?.address} </div>
                </div>

                <div className="border-double mb-3 mt-5">
                  <div>
                    <table className="divide-y-2 divide-gray-200 bg-white text-sm">
                      <thead className="text-left">
                        <tr>
                          <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                            Tên sản phẩm
                          </th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                            Kích thước
                          </th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                            Đơn Giá
                          </th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                            Số Lượng
                          </th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {modalInfo?.products?.map((item, i) => (
                          <tr key={i}>
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                              {item?.name || item?.initNameProduct}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                              {item?.selectedSize}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {formatCurrency(item?.sizes?.find(s => s.size == item?.selectedSize)?.price || item?.initPriceProduct)}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {item?.selectedQuantity}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {
                                formatCurrency(
                                  item?.sizes?.find(s => s.size == item?.selectedSize)?.price * item?.selectedQuantity || item.selectedQuantity * item?.initPriceProduct
                                )
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className=" text-right mt-5">
                  <div className="mb-1 ">
                    Tổng cộng:{" "}
                    {formatCurrency(
                      modalInfo?.products.reduce(
                        (total, item) =>
                          total +
                          item?.sizes?.find(s => s.size == item?.selectedSize)?.price * item?.selectedQuantity || item?.initPriceProduct * item?.selectedQuantity,
                        0
                      )
                    )}
                  </div>
                  <div className="mb-1 ">
                    Giảm giá:{" "}
                    {formatCurrency(
                      modalInfo?.salePrice
                    )}
                  </div>
                  <div className="mb-1">Phí vận chuyển: {formatCurrency(modalInfo?.transportFee)}</div>
                  <div className="mb-1 font-semibold">
                    Tổng thanh toán:{" "}
                    {formatCurrency(
                      modalInfo?.products.reduce(
                        (total, item) =>
                          total +
                          item?.sizes?.find(s => s.size == item?.selectedSize)?.price * item?.selectedQuantity || item?.initPriceProduct * item?.selectedQuantity,
                        0
                      ) + modalInfo.transportFee - modalInfo?.salePrice
                    )}
                  </div>

                  {/* <div className="mb-5">Trạng thái: {modalInfo?.products[0]?.status}</div> */}

                  <div className="text-left mt-5">
                    <div>
                      {" "}
                      Thời gian đặt hàng:{" "}
                      {moment(modalInfo?.createdAt).format(
                        "HH:mm - DD/MM/YYYY"
                      )}
                    </div>

                    <div className="font-bold ">
                      {" "}
                      Trạng thái đơn hàng:{" "} {
                        modalInfo?.products[0]?.status
                      }
                    </div>

                    <div className="font-bold ">
                      Phương thức thanh toán:{" "}
                      {modalInfo?.products[0]?.paymentMethod}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button className="my-[20px] " onClick={exportToPDF}>
              Xuất PDF
            </Button>
          </Box>
        </Modal>

        {/* Modal Review */}
        <ModalReview
          footer={null}
          title="Đánh giá sản phẩm"
          open={isModalOpenReview}
          onOk={handleOkReview}
          onCancel={handleCancelReview}
        >
          <div className="review-form-inner border p-3">
            <div id="respond" className="comment-respond">
              <form className="comment-form" onSubmit={handleSubmitReview}>
                <div className="comment-form-rating mb-3">
                  <Flex gap="middle" vertical>
                    <Rate
                      tooltips={desc}
                      onChange={setValueRate}
                      value={valueRate}
                    />
                  </Flex>
                </div>

                <div>
                  <Upload
                    name="images"
                    multiple={true}
                    action={import.meta.env.VITE_REACT_APP_API_UPLOAD_CLOUDINARY}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                  >
                    {fileList.length >= 8 ? null : uploadButton}
                  </Upload>
                  {previewImage && (
                    <Image
                      wrapperStyle={{ display: 'none' }}
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                      }}
                      src={previewImage}
                    />
                  )}
                </div>

                <div className="comment-form-comment">
                  <label htmlFor="comment" className="block font-normal">
                    Nhận xét của bạn{" "}
                    <span className="required text-red-400">*</span>
                  </label>
                  <textarea
                    onChangeCapture={(e: any) => setComment(e.target.value)}
                    className="min-h-[120px] w-full p-2 border focus:outline-none focus:ring transition-shadow duration-300 rounded-md"
                  />
                </div>


                <div className="form-submit my-3">
                  <input
                    name="submit"
                    type="submit"
                    className="btn hover:bg-[#2e3192] bg-blue-700 text-white text-center"
                    value="Gửi"
                  />
                </div>
              </form>
            </div>
          </div>
        </ModalReview>

        {/* Modal View Review */}
        <ModalReview
          footer={null}
          title="Đánh giá sản phẩm"
          open={isModalOpenViewReview}
          onOk={handleOkViewReview}
          onCancel={handleCancelViewReview}
        >
          <div className="review-form-inner border p-3">
            <div className="border py-2 mb-3 flex gap-x-2">
              <img src={viewReview?.product?.images[0].response.urls[0]} width={70} height={70} alt="img" />
              <div>
                <h3>{viewReview?.product?.name}</h3>
                <p>Kích thước: {viewReview?.selectedSize}</p>
                <p>So lượng mua: {viewReview?.selectedQuantity}</p>
              </div>
            </div>


            <div id="respond" className="comment-respond">
              <form className="comment-form">
                <div className="comment-form-rating mb-3">
                  <Flex gap="middle" vertical>
                    <Rate
                      tooltips={desc}
                      value={viewReview?.rating || undefined}
                    />
                  </Flex>
                </div>

                <div>
                  {
                    viewReview?.images?.map((image: any) => (
                      <img
                        src={image}
                        alt="image"
                        className="w-[50px] h-[50px] object-cover">

                      </img>))
                  }
                </div>

                <div className="comment-form-comment mt-2">
                  <label htmlFor="comment" className="block font-normal">
                    Nhận xét của bạn{" "}
                    {/* <span className="required text-red-400">*</span> */}
                  </label>
                  <textarea
                    placeholder="..."
                    value={viewReview?.comment || undefined}
                    className="min-h-[120px] w-full p-2 border focus:outline-none focus:ring transition-shadow duration-300 rounded-md"
                  />
                </div>
              </form>
            </div>
          </div>
        </ModalReview>

        {/* Modal HuyDon */}
        <ModalReview
          title="Hủy Đơn Hàng"
          open={isModalOpenHuyDon}
          onOk={handleOkHuyDon}
          onCancel={handleCancelHuyDon}>
          <div className="review-form-inner p-1">
            <div id="respond" className="comment-respond">
              <form className="comment-form">
                <div className="comment-form-comment mt-2">
                  <label htmlFor="comment" className="block font-normal">
                    Lý do hủy đơn hàng: {" "}
                  </label>
                  <textarea onChange={(e: any) => setReason(e.target.value)} value={reason}
                    className="min-h-[120px] w-full p-2 border focus:outline-none focus:ring transition-shadow duration-300 rounded-md"
                  />
                </div>
              </form>
            </div>
          </div>
        </ModalReview>
      </section>
    </div>
  );
};

export default OrderHistory;