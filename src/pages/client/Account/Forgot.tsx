import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../services/auth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
  const next = useNavigate()
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      next('/')
      toast("Bạn không thể truy cập vào trang này?")
    }
  }, []);

  const handelSubmitEmail = async () => {
    setLoading(true);
    try {
      await forgotPassword({ email: email });
      Swal.fire({
        title: "Chúng tôi đã gửi mật khẩu mới tới email của bạn!",
        text: "Vui lòng kiểm tra email.",
        icon: "success",
      })
    } catch (error) {
      Swal.fire({
        title: "Email không hop lệ!",
        text: "Vui lòng thử lại sau.",
        icon: "error"

      })
    }
    setLoading(false);
  };
  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-center px-6 my-12">
          <div className="w-full xl:w-3/4 lg:w-11/12 flex">
            <div
              className="w-full h-auto bg-gray-400 hidden lg:block lg:w-1/2 bg-cover rounded-l-lg"
              style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0pUC9TkdKSpjyb78YEHhO0cZnpeVkn-JymYQsOAvfoIrWF8IF_Xl3NHh0bHVWkMcrgmU&usqp=CAU')" }}
            ></div>
            <div className="w-full lg:w-1/2 p-2 rounded-lg lg:rounded-l-none">
              <div className="px-8 mb-4 text-center">
                <h3 className="pt-4 mb-2 xl:text-4xl text-3xl font-semibold">Quên mật khẩu?</h3>
                <p className="mb-4 text-sm text-gray-700">
                  Chúng tôi hiểu rồi, mọi thứ sẽ xảy ra. Chỉ cần nhập địa chỉ email của bạn bên dưới và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu của bạn!
                </p>
              </div>
              <form className="px-8 pt-6 pb-8 mb-4 bg-white rounded">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="email">
                    Email *
                  </label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-200 text-gray-700  border border-gray-300 rounded py-2 px-3 block w-full appearance-none"
                    id="email"
                    type="email"
                    placeholder="Enter Email Address..."
                  />
                </div>
                <div className="mb-6 text-center">
                  <button
                    className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                    type="button" onClick={handelSubmitEmail}
                  >
                    {isLoading ? <i className="fa fa-spinner fa-pulse"></i> : 'Đặt lại mật khẩu'}
                  </button>
                </div>
                <hr className="mb-6 border-t" />
                <div className="text-center">
                  <Link
                    className="inline-block text-sm text-slate-500 align-baseline hover:text-blue-800"
                    to="/signup"
                  >
                    Tạo một tài khoản!
                  </Link>
                </div>
                <div className="text-center">
                  <p className="inline-block text-sm text-slate-500 align-baseline "> Bạn đã có tài khoản?<Link to="/signin" className=" hover:text-blue-800">Đăng nhập!</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default Forgot;
