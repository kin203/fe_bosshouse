import { Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
// import { ReactQuill } from 'react-quill'; // Import React Quill
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { useParams } from "react-router-dom";
import { getBlog } from "../../../services/blog";
import { useAddBlog, useUpdateBlog } from "../../../hooks/apis/blog";
import axios from "axios";

const BlogForm = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const { mutateAsync: addBlog } = useAddBlog();
    const { mutate: updateBlog } = useUpdateBlog();
    const imagePreview = useRef(null);
    const [newAvatar, setNewAvatar] = useState(null);
    const [disable, setDisable] = useState(false);
    const [imageTitle, setImageTitle] = useState("");

    let mode = "add";
    if (id) mode = "update";

    useEffect(() => {
        try {
            if (id) {
                const fetchCategory = async () => {
                    const res = await getBlog(id);
                    form.setFieldsValue({
                        ...res.data,
                    });

                    setImageTitle(res?.data?.imageTitle);
                };
                fetchCategory();
            }
        } catch (error) {
            console.log(error);
        }
    }, [id]);

    const onFinish = async (values: any) => {
        try {
            if (mode === "add") {
                await addBlog({ ...values, imageTitle: imageTitle, author: "admin" });
                // console.log({ ...values, imageTitle: imageTitle })
            } else {
                await updateBlog({ ...values, imageTitle: imageTitle, _id: id });
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
        }
    };

    const changeFileAvatar = async (e) => {
        setNewAvatar(e); // Lưu trữ file mới khi người dùng chọn
        const imageUrl = URL.createObjectURL(e);

        imagePreview.current.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreview.current.src = imageUrl;

        //Upload
        const formData = new FormData();
        formData.append("images", e);
        const response = await axios.post(
            import.meta.env.VITE_REACT_APP_API_URL + "/image/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        setImageTitle(response?.data?.urls[0]);
    };

    return (
        <>
            <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl w-[90%] xl:min-w-[700px]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                        <Form form={form} onFinish={onFinish}>
                            <p className="text-center text-lg font-medium">
                                {mode === "add" ? "Thêm" : "Cập nhật"} bài viết
                            </p>

                            <div>
                                <label htmlFor="title">Tên tiêu đề</label>

                                <Form.Item
                                    name={"title"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="title">Ảnh bài viết</label>
                                <div className="image-container  mx-auto text-center mb-10">
                                    <img
                                        ref={imagePreview}
                                        src={imageTitle}
                                        className={`${imageTitle != "" ? "" : "hidden"}
                                     mx-auto h-[200px] inline-block object-cover`}
                                        alt="img"
                                    />

                                    <div className="mt-3 text-left">
                                        <input
                                            defaultValue={imageTitle ? imageTitle : ""}
                                            onChange={(e) => changeFileAvatar(e.target.files[0])}
                                            type="file"
                                            id="avatar-input"
                                            name="avatar"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* <div>
                                <label htmlFor="author">Người đăng</label>

                                <Form.Item
                                    name={"author"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên tác giả!" },
                                    ]}
                                >
                                    <Input placeholder="admin" defaultValue="admin" disabled />
                                </Form.Item>
                            </div> */}

                            <div>
                                <label htmlFor="content">Nội dung</label>

                                <Form.Item
                                    name={"content"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập nội dung bài viết!",
                                        },
                                    ]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        modules={{
                                            toolbar: [
                                                [{ header: "1" }, { header: "2" }, { font: [] }],
                                                [{ size: [] }],
                                                ["bold", "italic", "underline", "strike", "blockquote"],
                                                [
                                                    { list: "ordered" },
                                                    { list: "bullet" },
                                                    { indent: "-1" },
                                                    { indent: "+1" },
                                                ],
                                                ["link", "image", "video"],
                                                ["clean"],
                                            ],
                                        }}
                                        formats={[
                                            "header",
                                            "font",
                                            "size",
                                            "bold",
                                            "italic",
                                            "underline",
                                            "strike",
                                            "blockquote",
                                            "list",
                                            "bullet",
                                            "indent",
                                            "link",
                                            "image",
                                            "video",
                                        ]}
                                        placeholder="Nhập nội dung bài viết..."
                                    />
                                </Form.Item>
                            </div>

                            <button
                                type="submit"
                                disabled={disable}
                                className={`block w-full rounded-lg ${disable
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                    } px-5 py-3 text-sm font-medium text-white`}
                            >
                                {mode === "add" ? "Thêm bài viết" : "Cập nhật bài viết"}
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogForm;
