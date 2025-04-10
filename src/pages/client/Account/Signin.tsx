import { Checkbox, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn, useSignIn1 } from "../../../hooks/apis/auth";
import { useSignUp } from '../../../hooks/apis/auth';
import { useEffect, useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { getByEmail } from "../../../services/users";
import { signUp } from "../../../services/auth";
import Swal from "sweetalert2";
import checkPassword, { logOut } from "../../../utils/auth";
import Cookies from 'js-cookie';
import { toast } from "react-toastify";

const SignIn = () => {
  const { mutate: signIn } = useSignIn();
  const { mutate: signIn1 } = useSignIn1();
  const [remember, setRemember] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const [form] = Form.useForm();
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
  const next = useNavigate()

  useEffect(() => {
    if (user) {
      next('/')
      toast("Bạn đã đăng nhập vui lòng đăng xuất?")
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Thiết lập giá trị cho form sau khi render
    if (storedUser) {
      form.setFieldsValue({ email: storedUser.email, password: storedUser.password, remember: storedUser.remember });
    }
  }, [form, storedUser]);

  useEffect(() => {
    const rememberedUser = Cookies.get('rememberedUser');
    if (rememberedUser) {
      setStoredUser(JSON.parse(rememberedUser));
      setRemember(true);
    }
  }, []);

  const onFinish = async (values: any) => {
    await signIn({
      email: values.email,
      password: values.password
    });

    if (remember) {
      // Lưu thông tin vào cookies
      Cookies.set('rememberedUser', JSON.stringify(values), { expires: 2 });
    } else {
      // Xóa thông tin từ cookies
      Cookies.remove('rememberedUser');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <>
      <div className="py-6">
        <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
          <div className="hidden lg:block lg:w-1/2 bg-cover" style={{ backgroundImage: "url('https://file.hstatic.net/1000238938/file/oyed._kinh_nghiem_mua_ban_cho_samoyed_gia_re_tphcm_ha_noi_da_nang_21-1_a896e26e78c04d11bf01a9d99bde2eba_grande.jpg')" }}>
            <div className=' mt-[280px] text-center'>
              <h1 className="text-white font-bold text-4xl font-sans">Welcome Back!</h1>
              <p className="text-white mt-1">Bạn chưa có tài khoản? hãy chuyển sang đăng ký để tạo tài khoản !</p>
              <Link to={"/signup"}>
                <button type="submit" className="block w-28 bg-white hover:bg-blue-800  text-blue-800 mt-2 py-2 rounded-2xl  mb-2 mx-auto hover:-translate-y-1  overflow-hidden relative  font-bold  -- before:block before:absolute before:h-full before:w-1/2 before:rounded-full before:bg-blue-400 before:top-0 before:left-1/4 before:transition-transform before:opacity-0 before:hover:opacity-100 hover:before:animate-ping transition-all duration-300">Đăng ký</button>
              </Link>
            </div>
          </div>
          <div className="w-full p-8 lg:w-1/2">
            <h2 className="text-2xl font-bold  text-center xl:block hidden">BossHouse</h2>
            <h2 className="text-2xl font-bold  text-center xl:hidden block ">Đăng nhập</h2>
            <div className=" my-3 flex justify-center items-center">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  const decoded: { email: string, aud: string } = jwtDecode(credentialResponse?.credential);
                  (async () => {
                    const getOneUser = await getByEmail({ email: decoded?.email });

                    if (getOneUser?.data?.length == 0) {
                      const a = await signUp({ email: decoded?.email, password: decoded?.aud?.slice(0, 7) + 'test', confirmPassword: decoded?.aud?.slice(0, 7) + 'test' })

                      if (a.data.data.email) {
                        signIn1({ email: decoded?.email, password: decoded?.aud?.slice(0, 7) + 'test' })
                      } else {
                        signIn({ email: decoded?.email, password: decoded?.aud?.slice(0, 7) + 'test' })
                      }
                    } else {
                      const isChecked = await checkPassword(decoded?.aud?.slice(0, 7) + 'test', getOneUser.data[0].password)

                      if (isChecked) {
                        signIn({ email: decoded?.email, password: decoded?.aud?.slice(0, 7) + 'test' })
                      } else {
                        Swal.fire({
                          title: "Tài khoản đăng ký bằng email này đã tồn tại trên hệ thống!",
                          icon: "error"
                        })
                      }
                    }
                  })()
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-1/5 lg:w-1/4"></span>
              <p className="text-xs text-center text-gray-700 uppercase">HOẶC ĐĂNG NHẬP BẰNG EMAIL</p>
              <span className="border-b w-1/5 lg:w-1/4"></span>
            </div>
            <Form
              onFinish={onFinish}
              form={form}
            >
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    // { pattern: /^[a-zA-Z0-9._%+-]+@gmail.com$/, message: 'Vui lòng nhập một địa chỉ email đúng định dạng!' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="mt-4">
                <div className="flex justify-between">
                  <label className="block text-gray-700 text-sm font-bold mb-2">  Mật khẩu</label>
                </div>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập password!" },
                    { min: 6, message: "Mật khẩu dài tối thiểu 6 ký tự" }
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </div>
              <div className="flex justify-between ">
                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox onChange={(e) => setRemember(e.target.checked)}>Nhớ tài khoản</Checkbox>
                </Form.Item>
                <Link to="/forgot">
                  <div className=" text-gray-800">Quên mật khẩu ?</div>
                </Link>
              </div>
              <div className="">
                <button className="bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600"> Đăng nhập</button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="border-b w-1/5 md:w-1/4"></span>
                <Link to={"/signup"} className="text-xs text-gray-800 uppercase xl:hidden block">hoặc Đăng ký</Link>
                <span className="border-b w-1/5 md:w-1/4"></span>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
