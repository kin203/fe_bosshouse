import { Form, Input, TreeSelect, Upload, message, Tag, theme } from "antd";
import React, { useEffect, useState, useRef } from "react";
const { TextArea } = Input;
import type { UploadProps } from "antd";
const { Dragger } = Upload;
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
    addProduct,
    getProduct,
    updateProduct,
} from "../../../services/products";
import { getAllCategory } from "../../../services/categories";
import Swal from "sweetalert2";

import { PlusOutlined } from "@ant-design/icons";
import { TweenOneGroup } from "rc-tween-one";
import type { InputRef } from "antd";
import { updateProductCartFromAdmin } from "../../../services/cart";
import { useCategoryNoPaginate } from "../../../hooks/apis/category";
import { useAddProduct, useUpdateProduct } from "../../../hooks/apis/products";

const ProductForm = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const next = useNavigate();
    const [disable, setDisable] = useState(false);
    const [category, setCategory] = useState();
    // const [inputVisible, setInputVisible] = useState(false);
    // const [inputValue, setInputValue] = useState("");
    const [sizeAndPriceFields, setSizeAndPriceFields] = useState([
        { size: "", quantity: null, importPrice: null, price: null },
    ]);
    const { mutateAsync: addProduct } = useAddProduct()
    const { mutateAsync: updateProduct } = useUpdateProduct()

    let mode = "add";
    if (id) mode = "update";

    const { data } = useCategoryNoPaginate()
    // console.log(data)

    useEffect(() => {
        try {
            if (id) {
                const fetchProduct = async () => {
                    const res = await getProduct(id);
                    form.setFieldsValue({
                        ...res?.data,
                        categoryId: res?.data?.categoryId?._id,
                    });
                    // setTags(res?.data?.size || []);
                    setSizeAndPriceFields(res?.data?.sizes || []);
                };
                fetchProduct();
            }
        } catch (error) {
            console.log(error);
        }
    }, [id]);

    useEffect(() => {
        const newArray = data?.data?.reduce((a, b) => {
            return a.concat({ value: b._id, title: b.name });
        }, []);
        setCategory(newArray);
    }, [data]);

    useEffect(() => {
        setDisable(false)
    }, [sizeAndPriceFields]);

    const onFinish = async (values: IProduct) => {
        let dataAdd = {
            ...values,
            sizes: sizeAndPriceFields
        };

        const isFieldsFilled = sizeAndPriceFields.every(field => field.size && Number(field.price) > 0 && Number(field.quantity) >= 0);
        if (!isFieldsFilled) {
            Swal.fire({
                title: "Thêm sản phẩm thất bại!",
                text: "Vui lòng nhập đầy đủ kích thước và giá cho sản phẩm.",
                icon: "error",
            });
            return;
        }

        if (mode == "add") {
            setDisable(true);
            try {
                // console.log(dataAdd)

                addProduct(dataAdd);

                Swal.fire({
                    title: 'Thêm sản phẩm thành công!',
                    icon: "success",
                });

                setDisable(false);
                next("/admin/products");
            } catch (error) {
                Swal.fire({
                    title: "Thêm sản phẩm thất bại!",
                    // text: error?.response?.data?.message,
                    icon: "error",
                });
                setDisable(false);
            }
        } else {
            setDisable(true);
            try {
                // const res = await updateProduct({ ...values, sizes: sizeAndPriceFields, _id: id });
                updateProduct({ ...values, sizes: sizeAndPriceFields, _id: id });
                Swal.fire({
                    title: 'Cập nhật sản phẩm thành công!',
                    icon: "success",
                });
                // await updateProductCartFromAdmin({ ...values, sizes: sizeAndPriceFields, _id: id });

                setDisable(false);
                next("/admin/products");
            } catch (error) {
                Swal.fire({
                    title: "Cập nhật sản phẩm thất bại!",
                    text: error?.response?.data?.message,
                    icon: "error",
                });
                setDisable(false);
            }
        }
    };

    // Upload images
    const props: UploadProps = {
        name: "images",
        multiple: true,
        action: import.meta.env.VITE_REACT_APP_API_UPLOAD_CLOUDINARY,
        onChange(info) {
            const { status } = info.file;
            setDisable(true);
            if (status === "done") {
                setDisable(false);
                // console.log(info.fileList)
                // message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
            setDisable(false);
        },
    };

    /////////////////////////////////////////////////

    const handleAddField = () => {
        setSizeAndPriceFields([...sizeAndPriceFields, { size: "", quantity: "", importPrice: "", price: "" }]);
    };

    const handleRemoveField = (index) => {
        const values = [...sizeAndPriceFields];
        values.splice(index, 1);
        setSizeAndPriceFields(values);
    };

    const handleInputChange2 = (index, event) => {
        const values = [...sizeAndPriceFields];
        values[index][event.target.name] = event.target.value;
        setSizeAndPriceFields(values);
    };

    return (
        <>
            <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl w-[100%]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                        <Form form={form} onFinish={onFinish}>
                            <p className="text-center text-lg font-medium">
                                {mode == "add" ? "Thêm" : "Cập nhật"} sản phẩm
                            </p>

                            <div>
                                <label htmlFor="email">Tên sản phẩm</label>

                                <Form.Item
                                    name={"name"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Mô tả sản phẩm</label>

                                <Form.Item
                                    name={"description"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập mô tả sản phẩm!",
                                        },
                                    ]}
                                >
                                    <TextArea rows={4} />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Hình ảnh sản phẩm</label>

                                <Form.Item
                                    name={"images"}
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => e.fileList}
                                >
                                    <Dragger {...props}>
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined />
                                        </p>
                                        <p className="ant-upload-text">Kéo ảnh vào đây để upload</p>
                                        <p className="ant-upload-hint">
                                            Support for a single or bulk upload. Strictly prohibited
                                            from uploading company data or other banned files.
                                        </p>
                                    </Dragger>
                                </Form.Item>
                            </div>



                            <div className="mb-[20px]">
                                <label htmlFor="">Phân Loại - Số lượng - Giá Nhập - Giá bán</label>
                                <div className=" mx-auto bg-white p-6 rounded shadow-md">
                                    {sizeAndPriceFields.map((field, index) => (
                                        <div key={index} className="flex items-center mt-2">
                                            <input
                                                type="text"
                                                placeholder="Phân Loại"
                                                name="size"
                                                min={0}
                                                max={1000}
                                                value={field.size}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Số lượng"
                                                name="quantity"
                                                min={0}
                                                max={2000000}
                                                value={field.quantity}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Giá nhập"
                                                name="importPrice"
                                                min={0}
                                                max={2000000}
                                                value={field.importPrice}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Giá bán"
                                                name="price"
                                                min={0}
                                                max={2000000}
                                                value={field.price}
                                                onChange={(e) => handleInputChange2(index, e)}
                                                className="mr-3 px-3 max-w-[140px] py-1 border border-gray-300 rounded"
                                            />
                                            <button
                                                aria-label="Remove Field"
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
                                    {/* <button type="button" onClick={handleSubmit} className="mt-8 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Submit Product</button> */}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email">Danh mục</label>

                                <Form.Item
                                    name={"categoryId"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập danh mục sản phẩm!",
                                        },
                                    ]}
                                >
                                    <TreeSelect treeData={category} />
                                </Form.Item>
                            </div>

                            <button
                                disabled={disable}
                                type="submit"
                                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                            >
                                {mode == 'add' ? 'Thêm' : 'Cập nhật'} sản phẩm
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductForm;
