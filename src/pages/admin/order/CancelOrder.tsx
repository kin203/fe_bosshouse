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
import { Select, Button, Modal as ReaseModal, Pagination, Space, Table } from "antd";
import moment, { MomentInput } from "moment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency } from "../../../utils/products";
import { useGetAllOrder, useGetAllOrderNoPaginate } from "../../../hooks/apis/order";
import { vnPayRefund } from "../../../services/vnpay";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDebounce } from "../../../utils/debouce";
import { addRefund } from "../../../services/refundHistory";
import { Skeleton, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { OrderType } from "../../../common/type";
import { useColumnSearch } from "../../../hooks/useColumnSearch";
import { ColumnsType } from "antd/es/table";
import { sendMail } from "../../../services/email";

const CancelOrder = () => {
    const [dataOrderInit, setDataOrderInit] = useState([]);
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
        email: "",
    });
    const [current, setCurrent] = useState(1);

    // const { keyWordSearch } = useSelector(
    //     (state: { keyword: any }) => state.keyword
    // );

    // const keywordDebounce = useDebounce(keyWordSearch, 1000);
    // useEffect(() => {
    //     if (keywordDebounce && keywordDebounce.trim() != "") {
    //         const orderFilter = dataOrder.filter(
    //             (c) =>
    //                 c._id == keywordDebounce ||
    //                 c.fullName.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
    //                 c.phoneNumber.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
    //                 c.address.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
    //                 c.createdAt.includes(keywordDebounce.toLowerCase())
    //         );
    //         setDataOrder(orderFilter);
    //     } else {
    //         setDataOrder(dataOrderInit);
    //     }
    // }, [keywordDebounce]);

    const user = sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))
        : undefined;
    // console.log(user)

    const handleOpen = async (item: any) => {
        const order = await getOrder(item._id);

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

    // const { data, isLoading } = useGetAllOrder({ page: current });
    const { data: listOrderNoPaginate, isLoading } = useGetAllOrderNoPaginate()

    useEffect(() => {
        setDataOrder(listOrderNoPaginate?.data?.filter(
            (item: any) =>
                item.products[0].status == "Yêu Cầu Hủy Đơn Hàng" ||
                item?.products[0]?.status == "Xác Nhận Hủy Đơn Hàng" ||
                item?.products[0]?.status == "Từ Chối Hủy Đơn Hàng" ||
                item?.products[0]?.status == "Hoàn Tiền"
        ));
    }, [listOrderNoPaginate?.data]);

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

    const [reasonOrder, setReasonOrder] = useState("");
    const [isModalOpenR, setIsModalOpenR] = useState(false);
    const updateOrderStatus = async (
        orderId: string,
        status: string,
        products,
        email
    ) => {
        // Cập nhật lại giá trị status cho select
        const updatedDataOrder = dataOrder?.map((order) => {
            if (order._id == orderId) {
                order.products[0].status = status;
            }
            return order;
        });
        setDataOrder(updatedDataOrder);

        if (status == 'Từ Chối Hủy Đơn Hàng') {
            const res = await updateOrder({
                orderId: orderId,
                status: 'Chờ Xác Nhận',
                products: products,
                reason: reasonOrder,
            });
            // console.log(res)
        } else {
            const res = await updateOrder({
                orderId: orderId,
                status: status,
                products: products,
                reason: reasonOrder,
            });
            // console.log(res);
        }

        const res = await sendMail({
            email: email,
            orderId,
            status: status,
            data: { products }
        })

        toast.success("Đã cập nhật trạng thái đơn hàng");
    };

    const handleChange = async (value: string, option: any) => {
        try {
            await updateOrderStatus(option?.orderId, value, option?.products, option?.email);
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Cập nhật thất bại!",
                // text: 'Vui lòng thử lại sau.',
                icon: "error",
            });
        }
    };


    const showModalR = () => {
        setIsModalOpenR(true);
    };

    const handleOkR = () => {
        setIsModalOpenR(false);
    };

    const handleCancelR = () => {
        setIsModalOpenR(false);
    };
    //searching
    const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<OrderType>();
    //columns
    const columns: ColumnsType<OrderType> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            width: '4%',
            align: 'center',
            render: (value, record, index) => index + 1,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            width: '10%',
            ...getColumnSearchProps('_id'),

        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            width: '10%',
            ...getColumnSearchProps('fullName'),

        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            width: '10%',
            ...getColumnSearchProps('phoneNumber')
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: '15%',
            ...getColumnSearchProps('address'),
        },


        {
            title: 'Thời gian đặt hàng',
            dataIndex: 'createdAt',
            width: '12%',
            render: (value, record, index) => moment(record?.createdAt as MomentInput).format("HH:mm - DD/MM/YYYY"),
            //chuyển sang dạng số timestamp để sắp xếp
            sorter: (a, b) => moment(a.createdAt as MomentInput).unix() - moment(b.createdAt as MomentInput).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'products',
            width: '10%',
            render: (value, record, index) => record.products[0]?.paymentMethod,
            // ...getColumnSearchProps('address'),
            filters: [
                {
                    text: 'Thanh toán khi nhận hàng',
                    value: 'Thanh toán khi nhận hàng',
                },
                {
                    text: 'Thanh toán qua VnPay',
                    value: 'Thanh toán qua VnPay',
                },
            ],
            onFilter: (value, record) => record.products[0]?.paymentMethod === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'products.status',
            render: (value, record, index) => (
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
                                record?.products[0]?.status ===
                                "Từ Chối Hủy Đơn Hàng" ||
                                record?.products[0]?.status ===
                                "Hoàn Tiền",
                            amount:
                                record?.totalPrice - record?.transportFee - 500,
                            products: record?.products,
                        },
                        {
                            value: "Từ Chối Hủy Đơn Hàng",
                            label: "Từ Chối Hủy Đơn Hàng",
                            orderId: record?._id,
                            email: record?.email,
                            disabled:
                                record?.products[0]?.status ===
                                "Xác Nhận Hủy Đơn Hàng" ||
                                record?.products[0]?.status ===
                                "Hoàn Tiền",
                            products: record?.products,
                        },
                    ]}
                />
            ),
            filters: [
                {
                    text: 'Yêu Cầu Hủy Đơn Hàng',
                    value: 'Yêu Cầu Hủy Đơn Hàng',
                },
                {
                    text: 'Xác Nhận Hủy Đơn Hàng',
                    value: 'Xác Nhận Hủy Đơn Hàng',
                },
                {
                    text: 'Từ Chối Hủy Đơn Hàng',
                    value: 'Từ Chối Hủy Đơn Hàng',
                },
            ],
            onFilter: (value, record) => {
                console.log(record.products[0]?.status);
                return record.products[0]?.status === value

            },

        },
        {
            title: 'Lý do',
            dataIndex: 'products',
            render: (value, record, index) => (
                <Button
                    onClick={() => {
                        setReasonOrder(record?.products[0]?.reason);
                        showModalR();
                    }}
                >
                    Xem
                </Button>
            ),
        },

        {
            title: '',
            key: '',
            fixed: 'right',
            render: (value, record, index) => (
                <Space size="middle" className="text-xl">
                    <button
                        title="Chi tiết hóa đơn"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleOpen(record);
                        }}
                        type="button"
                        className=" text-blue-700 ml-1"
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>

                    {
                        record?.products[0]?.status == "Đã Xác Nhận Thanh Toán" ||
                            record?.products[0]?.status == "Chờ Xác Nhận" ||
                            record?.products[0]?.status == "Đã Xác Nhận"
                            ? (
                                <Link to={`/admin/order/update/${record?._id}`}>
                                    <button
                                        title="Cập nhật hóa đơn"
                                        type="button"
                                        className="text-lg text-green-600  ml-1"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                </Link>
                            ) : null
                    }

                    {/* 
                    <button aria-label='delete' type="button" onClick={() => handleDelete(String(record?._id))} className=" text-base text-red-500">
                        <i className="fa-regular fa-trash-can"></i>
                    </button> */}
                </Space>
            ),
        },
    ];

    const onShowSizeChange = (current, pageSize = 10) => {
        setCurrent(current);
        // setPageSize(pageSize);
        // if (pageSize < products) {
        //   setProducts(products.slice(0, pageSize))
        // }

        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newData = listOrderNoPaginate?.data?.slice(startIndex, endIndex);
        setDataOrder(newData);
    };
    return (
        <>
            <Table className='h-[80vh]'
                title={() => (
                    <div className='flex'>
                        <h3 className='font-bold text-3xl'>Yêu cầu hủy đơn hàng</h3>
                    </div>)}
                loading={isLoading}
                size='middle'
                rowKey='_id'
                expandable={{}}
                pagination={false}
                columns={columns.map((item) => ({ ...item }))}
                dataSource={dataOrder}
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
                            <div className="text-center text-2xl font-bold my-4">Hóa Đơn</div>
                            <div className="text-sm pl-2 text-left font-medium">
                                <div className=" mb-1">
                                    Tên khách hàng : {modalInfo?.fullName}
                                </div>
                                <div className=" mb-1">Email : {modalInfo?.email}</div>
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
                                                // console.log(item)
                                                return (
                                                    <tr key={i}>
                                                        <td className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 w-1/4">
                                                            {item?.name || item?.initNameProduct}
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
                                                );
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
                                <div className="mb-1">
                                    Phí vận chuyển: {formatCurrency(modalInfo?.transportFee)}
                                </div>
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

            {/* Lý do */}
            <ReaseModal
                title="Lý do hủy hàng"
                open={isModalOpenR}
                footer={null}
                onOk={handleOkR}
                onCancel={handleCancelR}
            >
                {reasonOrder}
            </ReaseModal>
        </>
    );
};
export default CancelOrder;