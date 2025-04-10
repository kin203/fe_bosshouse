import { Form, Input } from 'antd';
import { useFormAddUser, useSignUp } from '../../../hooks/apis/auth';

const UsersAdd = () => {
    const { mutate: signUp } = useFormAddUser()
    const onFinish = async (values: any) => {
        await signUp(values)
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <div className=" max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8 ">
                <div className="mx-auto max-w-2xl w-[90%]">
                    <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8 ">
                        <Form
                            // initialValues={{ remember: true }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                        >
                            <p className="text-center text-lg font-medium py-4">Form thêm tài khoản</p>
                            <div>
                                <label htmlFor="email" className='font-bold '>Email</label>
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Please input your username!' }, { pattern: /^[a-zA-Z0-9._%+-]+@gmail.com$/, message: 'Vui lòng nhập một địa chỉ email đúng định dạng!' }]}
                                >
                                    <Input type='email' />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="password" className='font-bold '>Mật khẩu</label>
                                <Form.Item
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Please input your password!' },
                                        { min: 6, message: "Mật khẩu dài tối thiểu 6 ký tự" }
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </div>

                            <div>
                                <label htmlFor="password" className='font-bold '>Nhập lại mật khẩu</label>
                                <Form.Item
                                    name="confirmPassword"
                                    rules={[{ required: true, message: 'Please input your password!' }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </div>

                            <div className="flex items-center justify-center">
                                <button
                                    type="submit"
                                    className="inline-block rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-3 text-sm font-medium text-white"
                                >
                                    Thêm tài khoản
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsersAdd;

