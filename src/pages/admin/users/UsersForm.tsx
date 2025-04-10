import { Form, Input, TreeSelect } from "antd";
import { useParams } from "react-router-dom";
import { useUpdateUsers } from "../../../hooks/apis/users";
import { useSignUp } from "../../../hooks/apis/auth";
import { getOneUsers } from "../../../services/users";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAll } from "../../../services/roles";

const UsersForm = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [disable, setDisable] = useState(false);
    const { mutateAsync: signUp } = useSignUp();
    const { mutateAsync: updateUsers } = useUpdateUsers();
    const [linkImg, setLinkImg] = useState("");
    const [newAvatar, setNewAvatar] = useState(null);
    const [roles, setRoles] = useState(null);

    let mode = "add";
    if (id) mode = "update";

    useEffect(() => {
        try {
            if (id) {
                const fetchUser = async () => {
                    const res = await getOneUsers(id);
                    form.setFieldsValue({
                        ...res.data,
                    });
                    setLinkImg(res?.data?.avatar);
                };
                fetchUser();
            }
        } catch (error) {
            console.log(error);
        }
    }, [id]);

    useEffect(() => {
        (async () => {
            const res = await getAll();
            setRoles(res?.data?.docs);
        })();
    }, []);

    const onFinish = async (values) => {
        if (newAvatar) {
            // Nếu có ảnh mới, thêm đường dẫn mới vào đối tượng values
            values.avatar = linkImg;
        }

        if (mode === "add") {
            await signUp(values);
        } else {
            await updateUsers({ ...values, _id: id });
        }
    };

    const imagePreview = useRef(null);
    const changeFileAvatar = async (e) => {
        setDisable(true);
        if (!e) {
            return;
        }
        setNewAvatar(e); // Lưu trữ file mới khi người dùng chọn
        const imageUrl = URL.createObjectURL(e);
        imagePreview.current.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreview.current.src = imageUrl;

        const formData = new FormData();
        formData.append("images", e);

        try {
            const response = await axios.post(
                import.meta.env.VITE_REACT_APP_API_URL + "/image/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setDisable(false);
            setLinkImg(response?.data?.urls[0]);
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
        }
    };

    return (
        <>
            <div className=" max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8 ">
                <div className="mx-auto max-w-2xl w-[90%]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8 ">
                        <Form form={form} onFinish={onFinish}>
                            <p className="text-center text-lg font-medium">
                                Form cập nhật tài khoản
                            </p>

                            <div>
                                <label htmlFor="email">Tên tài khoản</label>

                                <Form.Item
                                    name={"username"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên tài khoản!" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Email</label>

                                <Form.Item
                                    name={"email"}
                                    rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                                >
                                    <Input type="email" />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Ảnh đại diện</label>

                                <Form.Item>
                                    <div className="image-container  w-full flex ">
                                        <div className="">
                                            <label
                                                htmlFor="avatar-input"
                                                className="mt-40 px-2 py-1 border-[#000] border bg-[#e5e7eb]  hover:bg-[#b1b4b9] rounded-[5px] cursor-pointer"
                                            >
                                                Chọn tệp
                                            </label>
                                            <div className="hidden">
                                                <input
                                                    onChange={(e) => changeFileAvatar(e.target.files[0])}
                                                    type="file"
                                                    id="avatar-input"
                                                    name="avatar"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                        <img
                                            ref={imagePreview}
                                            src={linkImg}
                                            className="w-[30%] h-48 ml-20 inline-block object-cover"
                                            alt=""
                                        />
                                    </div>
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Số Điện Thoại</label>

                                <Form.Item
                                    name={"phoneNumber"}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Địa Chỉ</label>

                                <Form.Item
                                    name={"address"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập số lượng tài khoản!",
                                        },
                                    ]}
                                >
                                    <Input type="text" />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="email">Vai Trò</label>

                                <Form.Item
                                    name={"roleId"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập danh mục tài khoản!",
                                        },
                                    ]}
                                >
                                    <TreeSelect
                                        treeData={roles
                                            ?.map((item) => ({ value: item._id, title: item.role }))
                                            .concat([{ value: "guest", title: "Khách hàng" }])}
                                    />
                                </Form.Item>
                            </div>

                            <button
                                disabled={disable}
                                type="submit"
                                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                            >
                                {!disable ? "Cập nhật tài khoản" : "Loading..."}
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsersForm;
