import Loading from "../../../components/loading/Loading";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { deleteManyOrder, deleteOrder, getOrders, updateOrder } from "../../../services/order";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from '@mui/material/Button';
import { Pagination, Select } from 'antd';
import moment from "moment";
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

const RefundOrder = () => {
    const [dataOrderInit, setDataOrderInit] = useState([]);
    const [dataOrder, setDataOrder] = useState([]);
    const [open, setOpen] = useState(false);
    const [listOrderChecked, setListOrderChecked] = useState([])
    const [modalInfo, setModalInfo] = useState(null);
    const [current, setCurrent] = useState(1);

    const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)

    const keywordDebounce = useDebounce(keyWordSearch, 1000)
    useEffect(() => {
        if (keywordDebounce && keywordDebounce.trim() != '') {
            const orderFilter = dataOrder.filter(c =>
                c._id == keywordDebounce ||
                c.fullName.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
                c.phoneNumber.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
                c.address.toLowerCase().includes(keywordDebounce.toLowerCase()) ||
                c.createdAt.includes(keywordDebounce.toLowerCase())
            );
            setDataOrder(orderFilter);
        } else {
            setDataOrder(dataOrderInit);
        }
    }, [keywordDebounce]);

    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
    // console.log(user)

    const handleOpen = (item: any) => {
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

    // const { data, isLoading } = useGetAllOrder({ page: 1 })
    const { data: listOrderNoPaginate, isLoading } = useGetAllOrderNoPaginate()

    useEffect(() => {
        setDataOrder(listOrderNoPaginate?.data?.filter(
            (item: any) =>
                item.products[0].status == "Yêu Cầu Trả Hàng Hoàn Tiền" ||
                item?.products[0]?.status == "Xác Nhận Trả Hàng Hoàn Tiền" ||
                item?.products[0]?.status == "Từ Chối Trả Hàng Hoàn Tiền"
        ))
    }, [listOrderNoPaginate?.data]);


    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Xác nhận xóa!",
            text: "Bạn có muốn xóa đơn hàng này không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Không",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteOrder({
                        orderId: id
                    });
                    console.log(res)

                    Swal.fire({
                        title: "Xóa thành công!",
                        icon: "success"
                    })

                    setDataOrder(dataOrder.filter((item) => item._id != id));
                } catch (error) {
                    console.log(error)
                }
            }
        });
    };


    const handleDeleteMany = async () => {
        if (!confirm("Xác nhận xóa nhiều sản phẩm ?")) return

        try {
            const res = await deleteManyOrder(listOrderChecked)
            // Set lại state list sản phẩm khác với list sản phẩm đã bị xóa.
            const orderInAOnly = dataOrder.filter(itemA => {
                return !listOrderChecked.some(itemB => itemB._id == itemA._id);
            });
            setDataOrder(orderInAOnly)

            Swal.fire({
                title: "Xóa nhiều đơn hàng thành công!",
                icon: "success"
            })
        } catch (error) {
            console.log(error)
        }
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

            pdf.save("hoadon_bosshouse.pdf");
        });
    };

    // Change status
    const handleRefundRequest = async (option: any) => {
        const res = await vnPayRefund({
            orderId: option?.orderId,
            amount: option?.amount,
            transType: "03",
            user: user._id
        });
        console.log(res)

        Swal.fire({
            title: 'Đã gửi yêu cầu hoàn tiền!',
            text: `Mã đơn hàng: ${option?.orderId}.`,
            icon: 'success'
        });
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        await updateOrder({
            orderId: orderId,
            status: status
        });

        // Cập nhật lại giá trị status cho select
        const updatedDataOrder = dataOrder.map(order => {
            if (order._id == orderId) {
                order.products[0].status = status;
            }
            return order;
        });
        setDataOrder(updatedDataOrder);
    };

    const handleChange = async (value: string, option: any) => {
        try {

            await updateOrderStatus(option?.orderId, value);

            if (value == 'Xác Nhận Trả Hàng Hoàn Tiền') {
                await handleRefundRequest(option);
            }

            // Add refund
            await addRefund({ userId: user?._id, orderId: option?.orderId, amount: option?.amount || 0 })
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Hoàn tiền thất bại!',
                text: 'Vui lòng thử lại sau.',
                icon: 'error'
            });
        }
    };

    // check all
    const handleCheckAll = (event) => {
        const checked = event.target.checked;
        if (checked) {
            setListOrderChecked([...dataOrder]);
        } else {
            setListOrderChecked([]);
        }
    }

    // loại bỏ check k muốn xóa
    const onCheckedOrder = (dataOrder) => {
        setListOrderChecked((prevList) => {
            const isChecked = prevList.some((item) => item._id === dataOrder._id);
            if (isChecked) {
                // Nếu sản phẩm đã được chọn, loại bỏ nó khỏi danh sách
                const newList = prevList.filter((item) => item._id !== dataOrder._id);
                return newList;
            } else {
                // Nếu sản phẩm chưa được chọn, thêm nó vào danh sách
                const newList = [...prevList, dataOrder];
                return newList;
            }
        });
    };

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
            <div className="mx-4">
                <div className="flex justify-between py-3">
                    <div className="flex justify-between items-center w-full pr-3">
                        <h3 className="font-bold text-3xl">Đơn hàng hoàn trả</h3>
                        <div>
                            <Link to={'/admin/queryOrder'}><span className="btn btn-primary mr-2">Truy vấn giao dịch</span></Link>
                            <Link to={'/admin/confirmOrder'}><span className="btn btn-primary">Lịch sử hoàn tiền</span></Link>
                        </div>
                    </div>
                    <div className="flex ">
                        <div>
                            {
                                listOrderChecked?.length > 1 ? (
                                    <button onClick={handleDeleteMany} className='btn btn-primary'>Xóa all</button>) : undefined
                            }
                        </div>
                    </div>
                </div>
                {
                    dataOrder?.filter(i => i?.products[0]?.status == 'Yêu Cầu Trả Hàng Hoàn Tiền' || i.products[0].status == 'Xác Nhận Trả Hàng Hoàn Tiền' || i.products[0].status == 'Từ Chối Trả Hàng Hoàn Tiền')?.length > 0 ? (
                        <div>
                            <table className="table table-hover text-center">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col"><input onChange={handleCheckAll} type="checkbox" /></th>
                                        <th scope="col">STT</th>
                                        <th scope="col">Họ tên</th>
                                        <th scope="col">Số điện thoại</th>
                                        <th scope="col">Địa chỉ</th>
                                        <th scope="col">Thời gian đặt hàng</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                {isLoading ? (

                                    <>
                                        {[...Array(8)].map((index) => (
                                            <tr key={index} className={'cursor-pointer'}>

                                                <td className="pt-4">
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                                <td className='pt-4 flex justify-evenly'>
                                                    <Skeleton variant="text" width={100} />
                                                </td>
                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>

                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                                <td className='pt-4'>
                                                    <Typography variant='h6'><Skeleton variant="text" /></Typography>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tbody>
                                        {dataOrder
                                            ?.map((item: any, index: number) => {
                                                // console.log(item)
                                                return (
                                                    <tr onClick={() => onCheckedOrder(item)} key={index}>
                                                        <th scope="row">
                                                            <input type="checkbox" value={item._id} checked={listOrderChecked.some((order) => order._id === item._id)} />
                                                        </th>
                                                        <td className="text-[blue]">{index + 1}</td>
                                                        <td>{item?.fullName}</td>
                                                        <td>{item?.phoneNumber}</td>
                                                        <td>{item?.address?.length > 30 ? item?.address?.slice(0, 30) + '...' : item?.address}</td>
                                                        <td>{moment(item?.createdAt).format("HH:mm - DD/MM/YYYY")}</td>
                                                        <td onClick={(event) => event.stopPropagation()}>
                                                            <Select
                                                                value={item?.products[0]?.status}
                                                                style={{ width: 190 }}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: 'Yêu Cầu Trả Hàng Hoàn Tiền', label: 'Yêu Cầu Trả Hàng Hoàn Tiền', orderId: item?._id, disabled: true },
                                                                    { value: 'Xác Nhận Trả Hàng Hoàn Tiền', label: 'Xác Nhận Trả Hàng Hoàn Tiền', orderId: item?._id, disabled: item?.products[0]?.status === 'Từ Chối Trả Hàng Hoàn Tiền', amount: item?.totalPrice - item?.transportFee - 500 },
                                                                    { value: 'Từ Chối Trả Hàng Hoàn Tiền', label: 'Từ Chối Trả Hàng Hoàn Tiền', orderId: item?._id, disabled: item?.products[0]?.status === 'Xác Nhận Trả Hàng Hoàn Tiền' }
                                                                ]}
                                                            />
                                                        </td>
                                                        <td className="flex">
                                                            <button title="Chi tiết hóa đơn"
                                                                onClick={(event) => {
                                                                    event.stopPropagation()
                                                                    handleOpen(item)
                                                                }}
                                                                type="button"
                                                                className="btn btn-success bg-green-600  ml-1"
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>

                                                            {/* <button
                                                                title="Xóa hóa đơn"
                                                                onClick={() => handleDelete(item?._id)}
                                                                type="button"
                                                                className="btn btn-danger bg-red-600 ml-1"
                                                            >
                                                                <i className="fa-regular fa-trash-can"></i>
                                                            </button> */}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>)}
                            </table>

                            <Pagination current={current} onChange={onShowSizeChange} total={dataOrder?.length} className='text-center' />
                        </div>

                    ) : <div className="h-[61vh] flex justify-center mt-12">Danh sách trống</div>
                }
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
                                        ) + modalInfo?.transportFee
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
export default RefundOrder;