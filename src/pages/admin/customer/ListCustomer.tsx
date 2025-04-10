import Loading from "../../../components/loading/Loading";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import {
  deleteManyOrder,
  deleteOrder,
  getAllOrderNoPaginate,
  getOrder,
  getOrders,
  updateOrder
} from "../../../services/order";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
// import Button from '@mui/material/Button';
import { Dropdown, Select, Space, Button, Table } from "antd";
import moment from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency } from "../../../utils/products";
import { useGetAllOrder, useGetAllOrderNoPaginate } from "../../../hooks/apis/order";
import { DownOutlined } from "@ant-design/icons";
import order from "../../../redux/slices/order";
import { useSelector } from "react-redux";
import { useDebounce } from "../../../utils/debouce";
import { sendMail } from "../../../services/email";
import type { MenuProps } from "antd";
import { Link } from "react-router-dom";
import { useColumnSearch } from "../../../hooks/useColumnSearch";
import { OrderType } from "../../../common/type";
import { ColumnType } from "antd/es/table";


interface TableDataType {
  _id: string;
  relatedNames: string;
  phoneNumber: string;
  address: string;
  orderCount: number;
  totalPrice: number;
}

const ListCustomer = () => {
  document.title = "Quản lý đơn hàng";
  const [dataOrder, setDataOrder] = useState([]);
  const [open, setOpen] = useState(false);
  const [listOrderChecked, setListOrderChecked] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    _id: "",
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
    email: ""
  });
  const [stateDataSource, setStateDataSource] = useState(null);
  const [stateDataSourceInit, setStateDataSourceInit] = useState(null);

  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);

  const { keyWordSearch } = useSelector(
    (state: { keyword: any }) => state.keyword
  );

  const keywordDebounce = useDebounce(keyWordSearch, 700);
  useEffect(() => {
    if (keywordDebounce && keywordDebounce != "") {
      const orderFilter = stateDataSource?.filter(
        (c) =>
          c._id.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
          c.relatedNames.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
          c.phoneNumber == keywordDebounce ||
          c.address.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
          c.orderCount == keywordDebounce
      );
      setStateDataSource(orderFilter);
    } else {
      setStateDataSource(stateDataSourceInit);
    }
  }, [keywordDebounce]);
  

  const handleOpen = async (item: any) => {
    const order = await getOrder(item._id);
    console.log(order)
    if (order?.data) {
      setModalInfo(order?.data);
      setOpen(true);
    }
  };
  const handleClose = () => setOpen(false);

  const handleShowAllOrders = async () => {
    const orders = await getAllOrderNoPaginate();
    if (orders?.data) {
      setDataOrder(orders?.data);
      setShowAllOrdersModal(true);
    }
  };
  const handleCloseAllOrdersModal = () => setShowAllOrdersModal(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4
  };

  const { data, isLoading } = useGetAllOrderNoPaginate();
  useEffect(() => {
    setDataOrder(data?.data);
  }, [data]);


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


  useEffect(() => {
    //data sorted
    const dataSource = dataOrder
      ?.sort((a, b) => {
        const createdAtA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const createdAtB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return createdAtB - createdAtA;
      })
      ?.filter(i => i?.products[0]?.status != 'Yêu Cầu Trả Hàng Hoàn Tiền' && i.products[0].status != 'Xác Nhận Trả Hàng Hoàn Tiền')
      ?.reduce((acc, item) => {
        if (!acc.find(i => i.phoneNumber === item.phoneNumber)) {
          acc.push(item);
        }
        return acc;
      }, [])
      ?.map((item, index) => {
        const relatedNames = dataOrder
          .filter((order) => order.phoneNumber === item.phoneNumber)
          .map((order) => order.fullName)
          .filter((value, index, self) => self.indexOf(value) === index) // Xóa tên trùng lặp
          .join(", ");
        //Tính tổng số đơn mua hàng
        const orderCount = dataOrder.filter(
          (order) => order.phoneNumber === item.phoneNumber
        ).length;
        //Tính tổng số tiền của tất cả hóa đơn
        const totalPrice = dataOrder
          .filter((order) => order.phoneNumber === item.phoneNumber)
          .reduce((acc, curr) => acc + curr.totalPrice, 0);
        return {
          _id: item._id,
          relatedNames,
          phoneNumber: item.phoneNumber,
          address: item.address,
          orderCount,
          totalPrice,
        };
      });

    setStateDataSource(dataSource);
    setStateDataSourceInit(dataSource);
  }, [dataOrder]);



  //search
  const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<TableDataType>();

  const columns: ColumnType<TableDataType>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'relatedNames',
      ...getColumnSearchProps('relatedNames')
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      width: 150,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      // render: (address) => address.length > 30 ? `${address.slice(0, 30)}...` : address,
      render: (address) => address,
    },
    {
      title: 'Tổng đơn hàng',
      dataIndex: 'orderCount',
      width: 150,
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      render: (totalPrice) => totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    // {
    //   title: '',
    //   dataIndex: '',
    //   render: (text, record) => (
    //     <Button onClick={(event) => {
    //       event.stopPropagation();
    //       handleOpen(record);
    //     }}>
    //       <i className="fa-solid fa-eye"></i>
    //     </Button>
    //   ),
    // },
  ];
  return (
    <>
      <Table className='h-[80vh]'
        title={() => (
          <div className='flex'>
            <h3 className='font-bold text-3xl'>Danh sách Khách hàng</h3>
          </div>)}
        loading={isLoading}
        size='middle'
        rowKey='_id'
        pagination={false}
        columns={columns}
        dataSource={stateDataSource}
        // scroll={{ y: '65vh', x: true }}
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
                    Hóa Đơn #{modalInfo?._id}
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
                  Email : {modalInfo?.email}
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
                          Số Lượng
                        </th>
                        <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                          Kích thước
                        </th>
                        <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                          Đơn Giá
                        </th>
                        <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {modalInfo?.products?.map((item, i) => {
                        console.log(item)
                        return (
                          <tr key={i}>
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                              {item?.initNameProduct}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {item?.selectedQuantity}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                              {item?.selectedSize}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {formatCurrency(item?.sizes?.find(s => s.size == item?.selectedSize)?.price || item?.initPriceProduct)}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-gray-900 w-1/4">
                              {formatCurrency(
                                item?.sizes?.find(s => s.size == item?.selectedSize)?.price * item?.selectedQuantity || item?.initPriceProduct * item?.selectedQuantity
                              )}
                            </td>
                          </tr>
                        )
                      })}
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
                <div className="mb-1">Phí vận chuyển: {formatCurrency(modalInfo?.transportFee)}</div>
                <div className="mb-1 font-semibold">
                  Tổng thanh toán:{" "}
                  {formatCurrency(
                    modalInfo?.products.reduce(
                      (total, item) =>
                        total +
                        item?.sizes?.find(s => s.size == item?.selectedSize)?.price * item?.selectedQuantity || item?.initPriceProduct * item?.selectedQuantity,
                      0
                    ) + modalInfo.transportFee
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
    </>
  );
};

export default ListCustomer;
