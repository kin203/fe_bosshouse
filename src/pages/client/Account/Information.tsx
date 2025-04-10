import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer } from 'antd';
import { Form, Input, Upload } from "antd";
import { getOneUsers, updateUsers } from '../../../services/users';
import Swal from 'sweetalert2';
import axios from 'axios';
import { RiLockFill } from "react-icons/ri";

const Information = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [linkImg, setLinkImg] = useState("");
    const [disable, setDisable] = useState(false);
    const [newAvatar, setNewAvatar] = useState(null);
    const [newUsername, setNewUsername] = useState("");
    const [allowEdit, setAllowEdit] = useState(false);
    const next = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };
    const closeDropdown = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', closeDropdown);
        return () => {
            document.removeEventListener('mousedown', closeDropdown);
        };
    }, []);

    const userSession = sessionStorage.getItem('user');
    const user = JSON.parse(userSession);

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await getOneUsers(user._id);
            form.setFieldsValue({
                ...res.data,
            });
        };
        fetchProduct();
    }, []);

    const onFinish = async (value) => {
        try {
            const avatar = newAvatar ? linkImg : user.avatar;
            const res = await updateUsers({ ...value, _id: user._id, avatar });
            Swal.fire({
                title: "Cập nhật thành công!",
                icon: 'success'
            });
            next('/');
            const newUser = {
                ...user,
                avatar
            };
            sessionStorage.setItem("user", JSON.stringify(newUser));
            setNewUsername(value.username);
        } catch (error) {
            console.log(error);
        }
    }

    const logOut = () => {
        sessionStorage.clear();
        window.location.reload();
    };

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const imagePreview = useRef(null);
    const changeFileAvatar = async (e) => {
        setDisable(true);
        if (!e) {
            return;
        }
        setNewAvatar(e);
        const imageUrl = URL.createObjectURL(e);
        imagePreview.current.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreview.current.src = imageUrl;

        const formData = new FormData();
        formData.append('images', e);

        try {
            const response = await axios.post('http://localhost:7000/image/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setDisable(false);
            setLinkImg(response?.data?.urls[0]);
        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error);
        }
    };

    const handleAddFriendClick = () => {
        // Bật quyền sửa nội dung khi click vào nút "Add friend"
        setAllowEdit(true);
    };

    const handleMessageClick = () => {
        // Hủy thao tác và trở lại giao diện không cho phép nhập khi click vào nút "Message"
        setAllowEdit(false);
    };

    return (
        <>
            <Form form={form} onFinish={onFinish} className="md:grid grid-cols-4 grid-rows-2 mt-10 bg-white gap-2 p-4 rounded-xl">
                <div className="md:col-span-1 h-auto xl:shadow-xl ">
                    <div className="flex flex-col justify-center items-center ">
                        <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover" >
                            <img src='https://horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app/static/media/banner.ef572d78f29b0fee0a09.png' className="absolute flex h-32 w-full justify-center rounded-xl bg-cover" />
                            <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 ">
                                <img className="h-full w-full rounded-full" ref={imagePreview} src={user.avatar} alt="" />
                            </div>
                        </div>
                        <div className="mt-16 flex flex-col items-center">
                            <label htmlFor="avatar-input" className="p-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-md cursor-pointer">
                                <i className="far fa-file mr-1"></i> Chọn ảnh
                            </label>
                            <div className='hidden'>
                                <input onChange={(e) => changeFileAvatar(e.target.files[0])} type="file" id="avatar-input" name="avatar" accept="image/*" />
                            </div>
                        </div>
                        <div className="flex mt-4 space-x-3 lg:mt-6">
                            <span onClick={handleAddFriendClick} className="inline-flex items-center py-2 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 cursor-pointer">Sửa thông tin</span>
                            <span onClick={handleMessageClick} className="inline-flex items-center py-2 px-4 text-sm font-medium text-center text-white bg-red-700 rounded-lg border border-gray-300 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 cursor-pointer">Hủy sửa</span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-3 h-auto xl:shadow-xl p-4 space-y-2">
                    <div>
                        <label htmlFor="email">Tên tài khoản</label>
                        <Form.Item name={"username"} rules={[
                            { required: true, message: "Vui lòng nhập tên tài khoản!" },
                        ]}>
                            <Input type='text' disabled={!allowEdit} defaultValue={user.username} />
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <Form.Item name={"email"} rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            // { pattern: /^[a-zA-Z0-9._%+-]+@gmail.com$/, message: 'Vui lòng nhập một địa chỉ email đúng định dạng!' }
                        ]}>
                            <Input type="email" disabled={!allowEdit} defaultValue={user.email}/>
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Số Điện Thoại</label>
                        <Form.Item name={"phoneNumber"} rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                        ]}>
                            <Input name='sdt' disabled={!allowEdit} defaultValue={user.phoneNumber}/>
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Địa Chỉ</label>
                        <Form.Item name={"address"} rules={[
                            { required: true, message: "Vui lòng nhập số lượng tài khoản!" },
                        ]}>
                            <Input type="text" disabled={!allowEdit} defaultValue={user.address}/>
                        </Form.Item>
                    </div>
                    {/* Các trường khác tương tự */}
                    <button
                        disabled={!allowEdit} defaultValue={user.disabled}
                        type="submit"
                        className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                    >
                        {!disable ? "Cập nhật tài khoản" : "Loading..."}
                    </button>
                </div>
            </Form>
        </>
    )
}

export default Information;
