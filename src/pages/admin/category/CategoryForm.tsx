import {
    Form,
    Input,
} from "antd";
import { useEffect } from 'react'
const { TextArea } = Input;
import { useParams } from "react-router-dom";
import { getCategory } from "../../../services/categories";
import { useAddCategory, useUpdateCategory } from "../../../hooks/apis/category";

const CategoryForm = () => {
    const { id } = useParams()
    const [form] = Form.useForm();
    const { mutateAsync: addC } = useAddCategory()
    const { mutate: updateC } = useUpdateCategory()

    let mode = 'add'
    if (id) mode = 'update'

    useEffect(() => {
        try {
            if (id) {
                const fetchCategory = async () => {
                    const res = await getCategory(id)
                    form.setFieldsValue({
                        ...res.data,
                    })
                }
                fetchCategory()
            }
        } catch (error) {
            console.log(error)
        }
    }, [id]);

    const onFinish = async (values: any) => {
        if (mode == 'add') {
            await addC(values)
        } else {
            await updateC({ ...values, _id: id })
        }
    };

    return (
        <>
            <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl w-[90%] xl:min-w-[700px]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                        <Form
                            form={form}
                            onFinish={onFinish}
                        >
                            <p className="text-center text-lg font-medium">Form {mode == 'add' ? 'thêm' : 'cập nhật'} danh mục</p>

                            <div>
                                <label htmlFor="email">Tên danh mục</label>

                                <Form.Item name={"name"} rules={[
                                    { required: true, message: "Vui lòng nhập tên danh mục!" },
                                ]}>
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Mô tả danh mục</label>

                                <Form.Item name={"slug"} rules={[
                                    { required: true, message: "Vui lòng nhập mô tả danh mục!" },
                                ]}>
                                    <TextArea rows={4} />
                                </Form.Item>
                            </div>

                            <button
                                type="submit"
                                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                            >
                                {mode == 'add' ? 'Thêm' : 'Cập nhật'} danh mục
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryForm;