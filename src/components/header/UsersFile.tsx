import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer } from 'antd';
import { Form, Input } from "antd";
import Swal from 'sweetalert2';
import axios from 'axios';
import { logOut } from '../../utils/auth';
import { useUpdateUsers, useUser } from '../../hooks/apis/users';

const UsersFile = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [linkImg, setLinkImg] = useState("");
    const [disable, setDisable] = useState(false);
    const [newAvatar, setNewAvatar] = useState(null);
    const next = useNavigate();
    const [userQ, setUserQ] = useState(null);
    const { mutateAsync: updateUsers } = useUpdateUsers();


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

    const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined;
    const { data } = useUser(userSession?._id)

    useEffect(() => {
        if (data) {
            setUserQ(data?.data);
            form.setFieldsValue({
                ...data?.data,
            });
        }
    }, [data]);

    const onFinish = async (value) => {
        try {
            const avatar = newAvatar ? linkImg : userQ.avatar;
            await updateUsers({ ...value, _id: userQ._id, avatar });
            next('/');
        } catch (error) {
            console.log(error);
        }
    }

    const userRole: any = sessionStorage.getItem('roleId');

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
        setNewAvatar(e); // Lưu trữ file mới khi người dùng chọn
        const imageUrl = URL.createObjectURL(e);
        imagePreview.current.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreview.current.src = imageUrl;

        const formData = new FormData();
        formData.append('images', e);

        try {
            const response = await axios.post(import.meta.env.VITE_REACT_APP_API_URL +'/image/upload', formData, {
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

    // console.log(userRole);

    return (
        <>
            <li className={`nav-item dropdown no-arrow list-none   ${isDropdownOpen ? 'show' : ''}`} ref={dropdownRef}>
                <Link className="nav-link dropdown-toggle flex" to="#" id="userDropdown"
                    role="button" onClick={toggleDropdown} aria-haspopup="true"
                    aria-expanded={isDropdownOpen ? 'true' : 'false'}>
                    <span className="mr-2 d-none d-lg-inline text-gray-800 small text-base font-bold py-2">{userQ?.username}</span> {/* Sử dụng giá trị newUsername */}
                    <img style={{ objectFit: 'contain', display: "block", borderRadius: "100%" }} width={35} src={userQ?.avatar} />
                </Link>
                <div
                    className={`dropdown-menu dropdown-menu-right shadow animated--grow-in ${isDropdownOpen ? 'show' : ''}`}
                    aria-labelledby="userDropdown"
                >
                    {userRole != 'guest' ? (
                        <Link className="dropdown-item" to="/admin">
                            <i className="fa-solid fa-chart-simple fa-sm fa-fw mr-2"></i>
                            Admin
                        </Link>
                    ) : undefined}

                    <Link className="dropdown-item" to="#" onClick={showDrawer}>
                        <i className="fas fa-user fa-sm fa-fw mr-2 text-black" />
                        Hồ sơ
                    </Link>

                    <Link className="dropdown-item" to="/changePassword">
                        <i className="fa-solid fa-lock mr-2"></i>
                        Đổi mật khẩu
                    </Link>

                    <Link className="dropdown-item" to="/order-history">
                        <i className="fa-solid fa-store fa-sm fa-fw mr-2"></i>
                        Đơn hàng
                    </Link>

                    <div className="dropdown-divider" />
                    <Link
                        className="dropdown-item"
                        onClick={logOut}
                        to="#"
                        data-toggle="modal"
                        data-target="#logoutModal"
                    >
                        <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                        Đăng xuất
                    </Link>
                </div>
            </li>
            <Drawer style={{ width: "115%" }} title="Hồ sơ của bạn" onClose={onClose} visible={open} placement="left" >
                <Form form={form} onFinish={onFinish} className='xl:w-full w-[87%]'>
                    <div className=" h-auto flex flex-col justify-center items-center">
                        <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover" >
                            <img src='/public/images/banues.png' className="absolute flex h-32 w-full justify-center rounded-xl bg-cover" />
                            <div className=" absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 ">
                                <img className="h-full w-full rounded-full object-cover" ref={imagePreview} src={userQ?.avatar} alt="" />
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
                    </div>
                    <div>
                        <label htmlFor="email">Tên tài khoản</label>
                        <Form.Item name={"username"} rules={[
                            { required: true, message: "Vui lòng nhập tên tài khoản!" },
                        ]}>
                            <Input type='text' />
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <Form.Item name={"email"} rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                        ]}>
                            <Input type="email" />
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Số Điện Thoại</label>
                        <Form.Item name={"phoneNumber"} rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                        ]}>
                            <Input type='number' name='sdt' />
                        </Form.Item>
                    </div>

                    <div>
                        <label htmlFor="email">Địa Chỉ</label>
                        <Form.Item name={"address"} rules={[
                            { required: true, message: "Vui lòng nhập số lượng tài khoản!" },
                        ]}>
                            <Input type="text" />
                        </Form.Item>
                    </div>

                    <button
                        disabled={disable}
                        type="submit"
                        className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                    >
                        {!disable ? "Cập nhật tài khoản" : <i className="fa fa-spinner fa-pulse"></i>}
                    </button>
                </Form>
            </Drawer>
        </>
    );
};

export default UsersFile;
