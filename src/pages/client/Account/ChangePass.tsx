import { Form, Input } from 'antd';
import { useUpdateUsers } from '../../../hooks/apis/users';
import checkPassword from '../../../utils/auth';
import Swal from 'sweetalert2';
import { updateUsers } from '../../../services/users';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ChangePass = () => {
    const [form] = Form.useForm();
    const next = useNavigate();

    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined

    const onFinish = async (values) => {
        const isPasswordValid = await checkPassword(values.password, user.password);
        if (!isPasswordValid) {
            Swal.fire({
                title: "Đổi mật khẩu không thành công.",
                text: "Mật khẩu bạn nhập không chính xác!",
                icon: "error",
            })
            return
        }

        try {
            await updateUsers({ username: user.username, password: values.newpassword, _id: user._id })
            Swal.fire({
                title: "Đổi mật khẩu thành công.",
                icon: "success",
            })
            next('/')
        } catch (error) {
            console.log(error.message)

            Swal.fire({
                title: "Đổi mật khẩu không thành công!",
                text: "Vui lòng thử lại sau.",
                icon: "error",
            })
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#063970] to-blue-200">
            <div className="grid place-items-center mx-2 my-20 sm:my-auto">
                <div className="w-11/12 p-12 sm:w-8/12 md:w-6/12 lg:w-5/12 2xl:w-4/12
                px-6  sm:px-10 sm:py-6
                bg-white rounded-lg shadow-md lg:shadow-lg">
                    <div className="flex items-center space-x-2 mb-6">
                        <img src={user?.avatar} alt="Lock Icon" className="rounded-full w-10 h-10" />
                        <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Cập nhật mật khẩu để tăng cường bảo mật tài khoản.</p>
                    <Form
                        form={form}
                        onFinish={onFinish}
                    >
                        <div>
                            <label htmlFor="currentPassword" className='font-bold text-gray-700'>Mật khẩu hiện tại *</label>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Nhập tối thiểu 6 ký tự!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </div>

                        <div>
                            <label htmlFor="newpassword" className='font-bold text-gray-700'>Mật khẩu mới *</label>
                            <Form.Item
                                name="newpassword"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Nhập tối thiểu 6 ký tự!' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </div>

                        <div>
                            <label htmlFor="password" className='font-bold text-gray-700'>Xác nhận mật khẩu mới *</label>
                            <Form.Item
                                name="confirmPassword"
                                dependencies={['newpassword']}
                                rules={[{ required: true, message: 'Please input your password again!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newpassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu mới và mật khẩu xác nhận không khớp'));
                                    },
                                }),
                                { min: 6, message: 'Nhập tối thiểu 6 ký tự!' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </div>

                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="inline-block rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-3 text-sm font-medium text-white"
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div >
    )
}

export default ChangePass;
