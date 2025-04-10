import { BrowserRouter, Routes, Route } from "react-router-dom";
import BaseLayout from "./layout/BaseLayout";
import HomePage from "./pages/client/Homepage/HomePage";
import DetailPage from "./pages/client/Detail/DetailPage";
import NotFound from "./pages/errors/404";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import ListProduct from "./pages/admin/products/ListProduct.tsx";
import Shop from "./pages/client/Shop/Shop";
import AdminLayout from "./layout/AdminLayout";
import ListCategory from "./pages/admin/category/ListCategory";
import ListUsers from "./pages/admin/users/ListUsers";
import Settings from "./pages/admin/settings/Settings";
import ContactPage from "./pages/client/Contact";
import Blog from "./pages/client/Blog/Blog";
import Cart from "./pages/client/Cart/Cart";
import { BlogDeatl } from "./pages/client/Blog/BlogDeatl";
import SignIn from "./pages/client/Account/Signin";
import SignUp from "./pages/client/Account/Signup";
import Forgot from "./pages/client/Account/Forgot";
import Checkout from "./pages/client/Cart/Checkout";
import ProductForm from "./pages/admin/products/ProductForm";
import ScrollBtn from "./components/ScrollUpBtn/ScrollBtn.tsx";
import CategoryForm from "./pages/admin/category/CategoryForm";
import ListOrder from "./pages/admin/order/ListOrder";
import ListBlog from "./pages/admin/blog/ListBlog";
import UsersForm from "./pages/admin/users/UsersForm";
import OrderHistory from "./pages/client/Order/OrderHistory";
import OrderConfirmation from "./pages/client/Order/OrderConfirmation";
import VoucherForm from "./pages/admin/voucher/VoucherForm";
import UsersAdd from "./pages/admin/users/UsersAdd";
import BlogForm from "./pages/admin/blog/BlogForm";
import ListContact from "./pages/admin/contact/ListContact";
import ChangePass from "./pages/client/Account/ChangePass";
import Access from "./components/Access/Access";
import PrivateRoute from "./PrivateRouter/PrivateRouter";
import { isUserAllowed } from "./utils/privateRouter";
import ListVoucher from "./pages/admin/voucher/ListVoucher";
import AccessUpdate from "./components/Access/AccessUpdate";
import { useGetCartByUserId } from "./hooks/apis/carts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setCartQuantity } from "./redux/slices/Cart";
import Voucher from "./pages/client/Voucher/Voucher";
import RefundOrder from "./pages/admin/order/RefundOrder";
import QueryOrder from "./pages/admin/order/queryOrder";
import ConfirmRefundOrder from "./pages/admin/order/ConfirmRefundOrder";
import AdminProfile from "./components/Admin/AdminProfile.tsx";
import OrderForm from "./pages/admin/order/OrderForm.tsx";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListCustomer from "./pages/admin/customer/ListCustomer.tsx";
import CancelOrder from "./pages/admin/order/CancelOrder.tsx";
import DetailCategory from "./pages/admin/category/DetailCategory.tsx";
import OrderPaymentDelivery from "./pages/client/Order/OrderPaymentDelivery.tsx";
import { setReload } from "./redux/slices/Reload.ts";
import OrderDetail from "./pages/client/Order/OrderDetail.tsx";

const App = () => {
  const dispatch = useDispatch()
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined

  const { data } = useGetCartByUserId({ userId: user?._id })
  useEffect(() => {
    dispatch(setCartQuantity(data?.data?.carts?.length || 0))
  }, [data]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<BaseLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/dogshop" element={<Shop />} />
            <Route path="/products" element={<Shop />} />
            <Route path="/products/:id" element={<Shop />} />

            <Route path="/voucher" element={<Voucher />} />

            <Route path="/products/detail/:id" element={<DetailPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/blog" element={<Blog />} />
            <Route path="/blogDetail/:id" element={<BlogDeatl />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/*order */}
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/order-orderPaymentDelivery" element={<OrderPaymentDelivery />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order-history/orderdetail/:id" element={<OrderDetail />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/changePassword" element={<ChangePass />} />

          </Route>

          <Route path="admin" element={
            // Đường dẫn bắt đầu bằng '/admin' chỉ cho phép truy cập nếu quyền là 'admin' hoặc 'nhanvien'
            <PrivateRoute isAllowed={() => isUserAllowed(user, ['admin', 'nhanvien'])}>
              <AdminLayout />
            </PrivateRoute>
            // <AdminLayout />
          }>
            <Route index element={<Dashboard />} />

            {/* admin products */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<ListProduct />} />
            <Route path="/admin/products/add" element={<ProductForm />} />
            <Route path="/admin/products/update/:id" element={<ProductForm />} />

            {/* admin category */}
            <Route path="/admin/category" element={<ListCategory />} />
            <Route path="/admin/category/:id" element={<DetailCategory />} />
            <Route path="/admin/category/add" element={<CategoryForm />} />
            <Route path="/admin/category/update/:id" element={<CategoryForm />} />

            {/* admin user */}
            <Route path="/admin/users" element={<ListUsers />} />
            <Route path="/admin/users/add" element={<UsersAdd />} />
            <Route path="/admin/users/update/:id" element={<UsersForm />} />

            {/* admin blog */}
            <Route path="/admin/blog" element={<ListBlog />} />
            <Route path="/admin/blog/add" element={<BlogForm />} />
            <Route path="/admin/blog/update/:id" element={<BlogForm />} />

            {/* admin contact */}
            <Route path="/admin/contact" element={<ListContact />} />

            <Route path="/admin/customer" element={<ListCustomer />} />

            {/* admin voucher */}
            <Route path="/admin/voucher" element={<ListVoucher />} />
            <Route path="/admin/voucher/add" element={<VoucherForm />} />
            <Route path="/admin/voucher/update/:id" element={<VoucherForm />} />

            {/* admin donhang */}
            <Route path="/admin/listOrder" element={<ListOrder />} />
            <Route path="/admin/order/update/:id" element={<OrderForm />} />
            <Route path="/admin/refundOrder" element={<RefundOrder />} />
            <Route path="/admin/cancelOrder" element={<CancelOrder />} />
            <Route path="/admin/queryOrder" element={<QueryOrder />} />
            <Route path="/admin/confirmOrder" element={<ConfirmRefundOrder />} />

            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/access" element={<Access />} />
            <Route path="/admin/access/update/:id" element={<AccessUpdate />} />
            <Route path="/admin/access/add" element={<AccessUpdate />} />

            <Route path="/admin/adminProfile" element={<AdminProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ScrollBtn />

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        limit={5}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      // transition: Bounce
      />
    </>
  );
}

export default App;