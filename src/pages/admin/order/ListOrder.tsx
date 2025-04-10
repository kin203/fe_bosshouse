import Loading from "../../../components/loading/Loading";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import {
  deleteManyOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
} from "../../../services/order";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
// import Button from '@mui/material/Button';
import { Select, Space, Button, Table } from "antd";
import moment, { MomentInput } from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency } from "../../../utils/products";
import { useGetAllOrderNoPaginate } from "../../../hooks/apis/order";
import { useSelector } from "react-redux";
import { useDebounce } from "../../../utils/debouce";
import { sendMail } from "../../../services/email";
import { Link } from "react-router-dom";
import { getProduct } from "../../../services/products";
import { ColumnsType } from "antd/es/table";
import { OrderType } from "../../../common/type";
import { useColumnSearch } from "../../../hooks/useColumnSearch";
import { useUser } from "../../../hooks/apis/users";
import { useRole } from "../../../hooks/apis/roles";
import { toast } from "react-toastify";
import { vnPayRefund } from "../../../services/vnpay";
import { addRefund } from "../../../services/refundHistory";

const ListOrder = () => {
  const [dataOrderInit, setDataOrderInit] = useState([]);
  const [dataOrder, setDataOrder] = useState([]);
  const [open, setOpen] = useState(false);
  const [listOrderChecked, setListOrderChecked] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    _id: "",
    orderCode: "",
    fullName: "",
    phoneNumber: 0,
    address: "",
    message: "",
    name: "",
    products: [],
    transportFee: 0,
    totalPrice: 0,
    createdAt: "",
    paymentMethod: "",
    status: "",
    email: "",
    salePrice: 0,
  });
  const user = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : undefined;
  const [current, setCurrent] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  document.title = "Quản lý đơn hàng";

  const handleOpen = async (item: any) => {
    const order = await getOrder(item._id);
    // console.log(order)
    if (order?.data) {
      setModalInfo(order?.data);
      setOpen(true);
    }
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

  const { data, isLoading } = useGetAllOrderNoPaginate();
  useEffect(() => {
    // console.log(data?.data);

    setDataOrder(data?.data);
    setDataOrderInit(data?.data);
  }, [data]);

  const { keyWordSearch } = useSelector(
    (state: { keyword: any }) => state.keyword
  );
  const keyWordDebounce = useDebounce(keyWordSearch, 700);

  useEffect(() => {
    if (keyWordDebounce && keyWordDebounce != "") {
      const orderFilter = dataOrderInit.filter(
        (c) =>
          c._id.trim() == keyWordDebounce.trim() ||
          c.fullName
            .toLowerCase()
            ?.trim()
            .includes(keyWordDebounce.toLowerCase()) ||
          c.email
            .toLowerCase()
            ?.trim()
            .includes(keyWordDebounce.toLowerCase()) ||
          c.phoneNumber
            .toLowerCase()
            ?.trim()
            .includes(keyWordDebounce.toLowerCase()) ||
          c.address
            .toLowerCase()
            ?.trim()
            .includes(keyWordDebounce.toLowerCase()) ||
          c.orderCode?.trim().includes(keyWordDebounce.toLowerCase()) ||
          c.userId?.trim().includes(keyWordDebounce.toLowerCase())
      );
      setDataOrder(orderFilter);
    } else {
      setDataOrder(dataOrderInit);
    }
  }, [keyWordDebounce]);

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

      pdf.save("hoadon_bosshouse.pdf");
    });
  };

  // Hoàn TIền
  const handleRefundRequest = async (option: any) => {
    const res = await vnPayRefund({
      orderId: option?.orderId,
      amount: option?.amount,
      transType: "03",
      user: user._id,
    });
    console.log(res);

    Swal.fire({
      title: "Đã gửi yêu cầu hoàn tiền!",
      text: `Mã đơn hàng: ${option?.orderId}.`,
      icon: "success",
    });
  };

  const handleChange = async (value: string, option: any) => {
    try {
      // Cập nhật lại giá trị status cho select
      const updatedDataOrder = dataOrder.map((order) => {
        if (order._id === option?.orderId) {
          order.products[0].status = value;
        }
        return order;
      });
      setDataOrder(updatedDataOrder);

      if (value == "Từ Chối Hủy Đơn Hàng") {
        const res = await updateOrder({
          orderId: option?.orderId,
          status: "Chờ Xác Nhận",
          products: option?.products,
        });
        // console.log(res)
      } else if (value == "Xác Nhận Hủy Đơn Hàng") {
        const res = await updateOrder({
          orderId: option?.orderId,
          status: value,
          products: option?.products,
          reason: option?.reason,
        });
        // console.log(res);
      } else {
        const res = await updateOrder({
          orderId: option?.orderId,
          status: value,
          products: option?.products,
        });
        // console.log(res)
      }

      if (value == "Xác Nhận Trả Hàng Hoàn Tiền") {
        await handleRefundRequest(option);
        // Add refund
        await addRefund({
          userId: user?._id,
          orderId: option?.orderId,
          amount: option?.amount || 0,
        });
      }

      toast.success("Đã cập nhật trạng thái đơn hàng!");

      // send status to client
      const newProducts = await Promise.all(
        option?.data?.products.map(async (product) => {
          const product1 = await getProduct(product.productId);
          return { ...product1.data, ...product };
        })
      );

      if (
        newProducts &&
        (value == "Giao Hàng Thành Công" ||
          value == "Xác Nhận Trả Hàng Hoàn Tiền" ||
          value == "Xác Nhận Hủy Đơn Hàng" ||
          value == "Từ Chối Hủy Đơn Hàng" ||
          value == "Từ Chối Trả Hàng Hoàn Tiền"
        )
      ) {
        const res = await sendMail({
          email: option.data.email,
          type: "",
          orderId: option.data._id,
          status: value,
          data: { ...option.data, products: newProducts },
        });
        // console.log(res)
      }
    } catch (error) {
      console.log(error);
    }
  };

  //searching
  const { getColumnSearchProps, searchText, searchedColumn } =
    useColumnSearch<OrderType>();
  //columns
  const columns: ColumnsType<OrderType> = [
    {
      title: "STT",
      dataIndex: "stt",
      width: "4%",
      align: "center",
      render: (value, record, index) => index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      width: "10%",
      ...getColumnSearchProps("orderCode"),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      width: "12%",
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      width: "10%",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      width: "20%",
      // className: 'line-clamp-2 leading-9 overflow-hidden',
      ...getColumnSearchProps("address"),
    },

    {
      title: "Thời gian đặt hàng",
      dataIndex: "createdAt",
      width: "12%",
      render: (value, record, index) =>
        moment(record?.createdAt as MomentInput).format("HH:mm - DD/MM/YYYY"),
      //chuyển sang dạng số timestamp để sắp xếp
      // sorter: (a, b) => moment(a.createdAt as MomentInput).unix() - moment(b.createdAt as MomentInput).unix(),
      // defaultSortOrder: 'descend',
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "products",
      width: "15%",
      render: (value, record, index) => record.products[0]?.paymentMethod,
      // ...getColumnSearchProps('address'),
      filters: [
        {
          text: "Thanh toán khi nhận hàng",
          value: "Thanh toán khi nhận hàng",
        },
        {
          text: "Thanh toán qua VnPay",
          value: "Thanh toán qua VnPay",
        },
      ],
      onFilter: (value, record) => record.products[0]?.paymentMethod === value,
    },
    {
      title: "Trạng thái",
      width: "15%",
      dataIndex: "products.status",
      render: (value, record: any, index) => {
        if (
          record?.products[0]?.status == "Xác Nhận Hủy Đơn Hàng" ||
          record?.products[0]?.status == "Từ Chối Hủy Đơn Hàng" ||
          record?.products[0]?.status == "Yêu Cầu Hủy Đơn Hàng"
        ) {
          return (
            <Select
              value={record?.products[0]?.status}
              style={{ width: 190 }}
              onChange={handleChange}
              options={[
                {
                  value: "Yêu Cầu Hủy Đơn Hàng",
                  label: "Yêu Cầu Hủy Đơn Hàng",
                  orderId: record?._id,
                  disabled: true,
                },
                {
                  value: "Xác Nhận Hủy Đơn Hàng",
                  label: "Xác Nhận Hủy Đơn Hàng",
                  orderId: record?._id,
                  email: record?.email,
                  disabled:
                    record?.products[0]?.status === "Từ Chối Hủy Đơn Hàng" ||
                    record?.products[0]?.status === "Hoàn Tiền",
                  amount: record?.totalPrice - record?.transportFee - 500,
                  products: record?.products,
                  reason: record?.products[0]?.reason,
                },
                {
                  value: "Từ Chối Hủy Đơn Hàng",
                  label: "Từ Chối Hủy Đơn Hàng",
                  orderId: record?._id,
                  email: record?.email,
                  disabled:
                    record?.products[0]?.status === "Xác Nhận Hủy Đơn Hàng" ||
                    record?.products[0]?.status === "Hoàn Tiền",
                  products: record?.products,
                },
              ]}
            />
          );
        } else if (
          record?.products[0]?.status == "Đã Xác Nhận" ||
          record?.products[0]?.status == "Chờ Xác Nhận" ||
          record?.products[0]?.status == "Chờ Xác Nhận Thanh Toán" ||
          record?.products[0]?.status == "Đã Xác Nhận Thanh Toán" ||
          record?.products[0]?.status == "Đang Giao Hàng" ||
          record?.products[0]?.status == "Giao Hàng Thành Công" ||
          record?.products[0]?.status == "Hủy Đơn Hàng" ||
          record?.products[0]?.status == "Đã Nhận Hàng" ||
          record?.products[0]?.status == "Hoàn Tiền"
        ) {
          return (
            <Select
              value={record?.products[0]?.status}
              style={{ width: 170 }}
              onChange={(value, option) => handleChange(value, option)}
              options={[
                {
                  value: "Chờ Xác Nhận",
                  label: "Chờ Xác Nhận",
                  orderId: record?._id,
                  data: record,
                  disabled: true,
                },
                {
                  value: "Đã Xác Nhận",
                  label: "Đã Xác Nhận",
                  orderId: record?._id,
                  data: record,
                  disabled: record?.products[0]?.status !== "Chờ Xác Nhận",
                },
                {
                  value: "Chờ Xác Nhận Thanh Toán",
                  label: "Chờ Xác Nhận Thanh Toán",
                  orderId: record?._id,
                  data: record,
                  disabled:
                    record?.products[0]?.paymentMethod ==
                    "Thanh toán khi nhận hàng" ||
                    record?.products[0]?.status != "Đã Xác Nhận",
                },
                {
                  value: "Đã Xác Nhận Thanh Toán",
                  label: "Đã Xác Nhận Thanh Toán",
                  orderId: record?._id,
                  data: record,
                  disabled:
                    record?.products[0]?.paymentMethod ==
                    "Thanh toán khi nhận hàng" ||
                    record?.products[0]?.status != "Chờ Xác Nhận Thanh Toán",
                },
                {
                  value: "Đang Giao Hàng",
                  label: "Đang Giao Hàng",
                  orderId: record?._id,
                  data: record,
                  disabled:
                    record?.products[0]?.status !== "Đã Xác Nhận" &&
                    record?.products[0]?.status !== "Đã Xác Nhận Thanh Toán",
                },
                {
                  value: "Giao Hàng Thành Công",
                  label: "Giao Hàng Thành Công",
                  orderId: record?._id,
                  data: record,
                  disabled: record?.products[0]?.status !== "Đang Giao Hàng",
                  // && record?.products[0]?.status !== "Đã Xác Nhận Thanh Toán",
                },
                {
                  value: "Hủy Đơn Hàng",
                  label: "Hủy Đơn Hàng",
                  orderId: record?._id,
                  products: record.products,
                  data: record,
                  disabled:
                    record?.products[0]?.status == "Giao Hàng Thành Công" ||
                    record?.products[0]?.status == "Đã Nhận Hàng" ||
                    record?.products[0]?.status == "Đang Giao Hàng" ||
                    record?.products[0]?.status == "Hoàn Tiền",
                },
              ]}
            />
          );
        } else if (
          record?.products[0]?.status == "Yêu Cầu Trả Hàng Hoàn Tiền" ||
          record?.products[0]?.status == "Xác Nhận Trả Hàng Hoàn Tiền" ||
          record?.products[0]?.status == "Từ Chối Trả Hàng Hoàn Tiền"
        ) {
          return (
            <Select
              value={record?.products[0]?.status}
              style={{ width: 190 }}
              onChange={handleChange}
              options={[
                {
                  value: "Yêu Cầu Trả Hàng Hoàn Tiền",
                  label: "Yêu Cầu Trả Hàng Hoàn Tiền",
                  orderId: record?._id,
                  disabled: true,
                },
                {
                  value: "Xác Nhận Trả Hàng Hoàn Tiền",
                  label: "Xác Nhận Trả Hàng Hoàn Tiền",
                  orderId: record?._id,
                  disabled:
                    record?.products[0]?.status ===
                    "Từ Chối Trả Hàng Hoàn Tiền",
                  amount: record?.totalPrice - record?.transportFee - 500,
                  data: record,
                  products: record.products
                },
                {
                  value: "Từ Chối Trả Hàng Hoàn Tiền",
                  label: "Từ Chối Trả Hàng Hoàn Tiền",
                  orderId: record?._id,
                  disabled:
                    record?.products[0]?.status ===
                    "Xác Nhận Trả Hàng Hoàn Tiền",
                },
              ]}
            />
          );
        }
      },

      filters: [
        {
          text: "Chờ Xác Nhận",
          value: "Chờ Xác Nhận",
        },
        {
          text: "Đã Xác Nhận",
          value: "Đã Xác Nhận",
        },
        {
          text: "Chờ Xác Nhận Thanh Toán",
          value: "Chờ Xác Nhận Thanh Toán",
        },
        {
          text: "Đã Xác Nhận Thanh Toán",
          value: "Đã Xác Nhận Thanh Toán",
        },
        {
          text: "Đang Giao Hàng",
          value: "Đang Giao Hàng",
        },
        {
          text: "Giao Hàng Thành Công",
          value: "Giao Hàng Thành Công",
        },
        {
          text: "Hủy Đơn Hàng",
          value: "Hủy Đơn Hàng",
        },
        {
          text: "Yêu Cầu Hủy Đơn Hàng",
          value: "Yêu Cầu Hủy Đơn Hàng",
        },
        {
          text: "Xác Nhận Hủy Đơn Hàng",
          value: "Xác Nhận Hủy Đơn Hàng",
        },
        {
          text: "Từ Chối Hủy Đơn Hàng",
          value: "Từ Chối Hủy Đơn Hàng",
        },
        {
          text: "Yêu Cầu Trả Hàng Hoàn Tiền",
          value: "Yêu Cầu Trả Hàng Hoàn Tiền",
        },
        {
          text: "Xác Nhận Trả Hàng Hoàn Tiền",
          value: "Xác Nhận Trả Hàng Hoàn Tiền",
        },
        {
          text: "Từ Chối Trả Hàng Hoàn Tiền",
          value: "Từ Chối Trả Hàng Hoàn Tiền",
        },
      ],
      onFilter: (value, record) => {
        // console.log(record.products[0]?.status);
        return record.products[0]?.status === value;
      },
    },

    {
      title: "",
      key: "",
      fixed: "right",
      render: (value, record, index) => (
        <Space size="middle" className="text-lg">
          <button
            title="Chi tiết hóa đơn"
            onClick={(event) => {
              event.stopPropagation();
              handleOpen(record);
            }}
            type="button"
            className=" text-blue-700"
          >
            <i className="fa-solid fa-eye"></i>
          </button>

          {(record?.products[0]?.status == "Đã Xác Nhận Thanh Toán" ||
            record?.products[0]?.status == "Chờ Xác Nhận" ||
            record?.products[0]?.status == "Đã Xác Nhận") &&
            permissions?.includes("updateOrder") ? (
            <Link to={`/admin/order/update/${record?._id}`}>
              <button
                title="Cập nhật hóa đơn"
                type="button"
                className="text-xl text-green-800"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </Link>
          ) : null}

          {/* 
                    <button aria-label='delete' type="button" onClick={() => handleDelete(String(record?._id))} className=" text-base text-red-500">
                        <i className="fa-regular fa-trash-can"></i>
                    </button> */}
        </Space>
      ),
    },
  ];

  // Phân quyền
  const userSession = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : undefined;
  const { data: u } = useUser(userSession?._id);
  const { data: dataRole } = useRole(u?.data?.roleId);
  const [permissions, setPermission] = useState([]);

  useEffect(() => {
    if (dataRole) {
      setPermission(dataRole?.data?.permissions);
    }
  }, [dataRole, u]);

  return (
    <>
      <Table
        className="h-[80vh]"
        title={() => (
          <div className="flex justify-between py-3 mx-3">
            <h3 className="font-bold text-3xl">Danh sách đơn hàng</h3>
          </div>
        )}
        loading={isLoading}
        size="middle"
        rowKey="_id"
        pagination={{
          position: ["bottomCenter"],
        }}
        rowSelection={{
          onSelect: (record, selected, selectedRows) => {
            console.log(record, selected, selectedRows);
            setListOrderChecked(selectedRows);
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            // console.log(selected, selectedRows, changeRows);
            setListOrderChecked(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            // console.log(selectedRowKeys, selectedRows);
            setListOrderChecked(selectedRows);
          },
        }}
        columns={columns.map((item) => ({ ...item }))}
        dataSource={dataOrder}
        // scroll={{ y: "65vh", x: true }}
      />

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
              <div className="text-center text-2xl font-bold my-4">Hóa Đơn</div>
              <div className="text-sm pl-2 text-left font-medium">
                <div className=" mb-1">
                  Tên khách hàng : {modalInfo?.fullName}
                </div>
                <div className=" mb-1">Eamil : {modalInfo?.email}</div>
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
                            {formatCurrency(
                              item?.sizes?.find(
                                (s) => s.size == item?.selectedSize
                              )?.price || item?.initPriceProduct
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                            {item?.selectedQuantity}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                            {formatCurrency(
                              item?.sizes?.find(
                                (s) => s.size == item?.selectedSize
                              )?.price * item?.selectedQuantity ||
                              item.selectedQuantity * item?.initPriceProduct
                            )}
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
                        item?.sizes?.find((s) => s.size == item?.selectedSize)
                          ?.price *
                        item?.selectedQuantity ||
                        item?.initPriceProduct * item?.selectedQuantity,
                      0
                    )
                  )}
                </div>
                <div className="mb-1 ">
                  Giảm giá: {formatCurrency(modalInfo?.salePrice)}
                </div>
                <div className="mb-1">
                  Phí vận chuyển: {formatCurrency(modalInfo?.transportFee)}
                </div>
                <div className="mb-1 font-semibold">
                  Tổng thanh toán:{" "}
                  {formatCurrency(
                    modalInfo?.products.reduce(
                      (total, item) =>
                        total +
                        item?.sizes?.find((s) => s.size == item?.selectedSize)
                          ?.price *
                        item?.selectedQuantity ||
                        item?.initPriceProduct * item?.selectedQuantity,
                      0
                    ) +
                    modalInfo.transportFee -
                    modalInfo?.salePrice
                  )}
                </div>

                {/* <div className="mb-5">Trạng thái: {modalInfo?.products[0]?.status}</div> */}

                <div className="text-left mt-5">
                  <div>
                    {" "}
                    Thời gian đặt hàng:{" "}
                    {moment(modalInfo?.createdAt).format("HH:mm - DD/MM/YYYY")}
                  </div>

                  <div className="font-bold ">
                    {" "}
                    Trạng thái đơn hàng: {modalInfo?.products[0]?.status}
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
    </>
  );

};
export default ListOrder;