import { Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getOrder, updateOrderProduct } from "../../../services/order";

const OrderForm = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const next = useNavigate();
    // const [sizeAndPriceFields, setSizeAndPriceFields] = useState([
    //     { size: "", quantity: "", price: "" },
    // ]);

    useEffect(() => {
        try {
            if (id) {
                const fetchOrder = async () => {
                    const res = await getOrder(id);
                    form.setFieldsValue({
                        ...res?.data
                    });
                    // setSizeAndPriceFields(res?.data?.sizes || []);
                };
                fetchOrder();
            }
        } catch (error) {
            console.log(error);
        }
    }, [id]);

    const onFinish = async (values) => {
        let dataAdd = {
            ...values,
            // sizes: sizeAndPriceFields
        };

        // const isFieldsFilled = sizeAndPriceFields.every(field => field.size && field.price);
        // if (!isFieldsFilled) {
        //     Swal.fire({
        //         title: "Thêm sản phẩm thất bại!",
        //         text: "Vui lòng nhập đầy đủ kích thước và giá cho sản phẩm.",
        //         icon: "error",
        //     });
        //     return;
        // }


        try {
            // const res = await updateProduct({ ...values, sizes: sizeAndPriceFields, _id: id });
            const res = await updateOrderProduct({ ...dataAdd, _id: id });

            Swal.fire({
                title: 'Cập nhật đơn hàng thành công',
                icon: "success",
            });
            next('/admin/listOrder');
        } catch (error) {
            Swal.fire({
                title: "Cập nhật đơn hàng thất bại!",
                text: error?.response?.data?.message,
                icon: "error",
            });
        }

    };

    // const handleAddField = () => {
    //     setSizeAndPriceFields([...sizeAndPriceFields, { size: "", quantity: "", price: "" }]);
    // };

    // const handleRemoveField = (index) => {
    //     const values = [...sizeAndPriceFields];
    //     values.splice(index, 1);
    //     setSizeAndPriceFields(values);
    // };

    // const handleInputChange2 = (index, event) => {
    //     const values = [...sizeAndPriceFields];
    //     values[index][event.target.name] = event.target.value;
    //     setSizeAndPriceFields(values);
    // };

    return (
        <>
            <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto w-[700px]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                        <Form form={form} onFinish={onFinish}>
                            <p className="text-center text-lg font-medium">
                                Cập nhật đơn hàng
                            </p>

                            <div>
                                <label htmlFor="email">Tên khách hàng</label>

                                <Form.Item
                                    name={"fullName"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên khách hàng!" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Email</label>

                                <Form.Item
                                    name={"email"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập email khách hàng!",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="phoneNumber">Số điện thoại</label>

                                <Form.Item
                                    name={"phoneNumber"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập SĐT khách hàng!",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="address">Địa chỉ</label>

                                <Form.Item
                                    name={"address"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập địa chỉ khách hàng!",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="transportFee">Phí vận chuyển</label>

                                <Form.Item
                                    name={"transportFee"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập phí vận chuyển!",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="totalPrice">Tổng tiền</label>

                                <Form.Item
                                    name={"totalPrice"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng tổng tiền đơn hàng!",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            {/* <div className="mb-[20px]">
                                <label htmlFor="">Đơn vị - Số lượng - Giá bán</label>
                                <div className=" mx-auto bg-white p-6 rounded shadow-md">
                                    {sizeAndPriceFields.map((field, index) => (
                                        <div key={index} className="flex items-center mt-2">
                                            <input
                                                type="text"
                                                placeholder="Đơn vị"
                                                name="size"
                                                min={0}
                                                max={1000000}
                                                value={field.size}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Số lượng"
                                                name="quantity"
                                                min={0}
                                                max={1000000}
                                                value={field.quantity}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Giá bán"
                                                name="price"
                                                min={0}
                                                max={1000000}
                                                value={field.price}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <button
                                                onClick={() => handleRemoveField(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    ></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleAddField}
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Thêm Phân Loại
                                    </button>
                                </div>
                            </div> */}

                            <button
                                type="submit"
                                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                            >
                                Cập nhật
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderForm;
