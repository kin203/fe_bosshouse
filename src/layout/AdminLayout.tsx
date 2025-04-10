import { Outlet, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { IoKeyOutline } from "react-icons/io5";
import {
  HomeOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  FolderOpenOutlined,
  DiffOutlined,
  UserAddOutlined,
  SettingOutlined,
  SolutionOutlined,
  ContactsOutlined,
  TagsOutlined,
  FileWordOutlined,
  UserSwitchOutlined,
  UnorderedListOutlined,
  RollbackOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import AdminTopBar from "../components/AdminTopBar";
import { useRole } from "../hooks/apis/roles";
import { useUser } from "../hooks/apis/users";
import { useDispatch } from "react-redux";
import { resetCategory } from "../redux/slices/selectedCategorySlice";
import Loading from "../components/loading/Loading";

const { Footer, Sider } = Layout;

// ... (your other imports)

const AdminLayout = () => {
  const next = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [permissions, setPermission] = useState([]);
  const [dataR, setDataR] = useState(null);
  const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
  const { data: u } = useUser(userSession?._id)
  const dispatch = useDispatch();


  const { data } = useRole(u?.data?.roleId)
  useEffect(() => {
    if (data) {
      setPermission(data?.data?.permissions);
      setDataR(data?.data?.role);
    }
  }, [data, u]);

  const handleClick = ({ key }: { key: string }) => {
    if (key === '/products') {
      dispatch(resetCategory());
    }
    next("/admin" + key);
  };

  const menuItem = [
    { label: "Trang Chủ", key: "/../", icon: <HomeOutlined /> },
    { label: "Thống Kê", key: "/dashboard", icon: <DashboardOutlined /> },
    {
      label: "Quản lý",
      key: "sub1",
      icon: <ApartmentOutlined />,
      children: [
        { label: "Sản phẩm", key: "/products", icon: <DiffOutlined />, disabled: !permissions?.includes("viewProduct") },
        { label: "Danh mục", key: "/category", icon: <FolderOpenOutlined />, disabled: !permissions?.includes("viewCategory") },
        { label: "Người dùng", key: "/users", icon: <UserAddOutlined />, disabled: !permissions?.includes("viewUser") },
        { label: "Khách hàng", key: "/customer", icon: <UserAddOutlined />, },
        { label: "Bài viết", key: "/blog", icon: <FolderOpenOutlined />, disabled: !permissions?.includes("viewContact") },
        { label: "Liên hệ", key: "/contact", icon: <ContactsOutlined /> },
        { label: "Giảm giá", key: "/voucher", icon: <TagsOutlined />, disabled: !permissions?.includes("viewVoucher") },
        {
          label: "Đơn Hàng", key: "sub2", icon: <SolutionOutlined />, disabled: !permissions?.includes("viewOrder"),
          children: [
            { label: "Danh Sách", key: "/listOrder", icon: <UnorderedListOutlined /> },
            // { label: "Truy Vấn", key: "/queryOrder", icon: <FolderOpenOutlined /> },
            { label: "Lịch Sử Trả Hàng", key: "/confirmOrder", icon: <RollbackOutlined /> },
          ],
        },
      ],
    },
    {
      label: "Phân quyền", key: "/access", icon: <UserSwitchOutlined />, disabled: !dataR?.toLowerCase()?.includes("admin"),
      // children: [
      //   { label: "Quản lý nhóm", key: "/access", icon: <FolderOpenOutlined />, disabled: !dataR?.toLowerCase()?.includes("admin") },
      // ],
    },
    // { label: "Cài Đặt", key: "/settings", icon: <SettingOutlined /> },
  ];

  return (
    <>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            position: "fixed",
            height: "110vh",
            left: 0,
            zIndex: 1,
            // display: 'none'
            // overflow: "scroll"
          }}
        >
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItem}
            onClick={handleClick}
          />
        </Sider>
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: "margin 0.2s" }}>
          <AdminTopBar />
          <Outlet />
          <Footer style={{ textAlign: "center" }}>
            Bản quyền thuộc về BossHouse
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default AdminLayout;
