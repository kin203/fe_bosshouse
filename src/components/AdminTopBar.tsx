import { Input, Button } from "antd";
import UserProfile from "./UserProfire";
import { useDispatch } from "react-redux";
import { setKeyword } from "../redux/slices/keywordSearch";
const { Search } = Input;
import { useEffect, useState } from "react";
import { getAllContact } from "../services/contact";
import { Link } from "react-router-dom";
import { useNotificationToAdmin } from "../hooks/apis/notification";
import moment from "moment";
import { updateStatusNotification } from "../services/notification";
import instance from "../services/config/instance";
import { IoIosMailOpen } from "react-icons/io";
import { SolutionOutlined } from "@ant-design/icons";

const AdminTopBar = () => {
  const dispatch = useDispatch()
  const [listNotification, setListNotification] = useState([]);
  const { data } = useNotificationToAdmin()
  // console.log(data)

  useEffect(() => {
    setListNotification(data?.data?.docs)
  }, [data]);
  // console.log(listNotification)

  const handleChangeIsRead = async (id) => {
    const res = await updateStatusNotification({ _id: id })
    // console.log(res)

    // Sau khi cập nhật thành công, cập nhật lại state listNotification
    const updatedList = listNotification.map(item => {
      if (item._id == id) {
        return { ...item, isRead: true };
      }
      return item;
    });
    setListNotification(updatedList);
  }

  const showMore = async () => {
    const res = await instance.get('/notification/getAllToAdmin?_limit=20')
    setListNotification(res?.data?.docs)
  }

  const readAll = async () => {
    const res = await instance.post('/notification/updateAllStatusNotification', { to: "admin" })

    // Sau khi cập nhật thành công, cập nhật lại state listNotification
    const updatedList = listNotification.map(item => {
      return { ...item, isRead: true };
    });
    setListNotification(updatedList);
  }

  // end notification

  const handleInput = (e) => {
    const value = e.target.value;
    dispatch(setKeyword(value))
  };

  const handleSearch = async (value, e) => {
    e.preventDefault()
    dispatch(setKeyword(value))
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const [notifileOpen, setNotifileOpen] = useState(false);

  const toggleNotifile = () => {
    setNotifileOpen(!notifileOpen);
  };

  return (
    <>
      {/* Topbar */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-1 static-top shadow z-50">
        {/* Sidebar Toggle (Topbar) */}
        <div>
          <button
            id="sidebarToggleTop"
            className="btn btn-link d-md-none rounded-circle mr-3"
          >
            <i className="fa fa-bars" />
          </button>
          <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
            <Search
              placeholder="Nhập tên, danh mục, ..."
              allowClear
              enterButton={
                <Button style={{ backgroundColor: 'ButtonShadow' }} htmlType="submit">
                  Tìm kiếm
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              onInput={handleInput}
            />
          </form>
        </div>
        {/* Topbar Navbar */}
        <ul className="navbar-nav ml-auto">
          {/* Nav Item - Search Dropdown (Visible Only XS) */}
          <li className="nav-item dropdown no-arrow d-sm-none">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="searchDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-search fa-fw" />
            </a>
            {/* Dropdown - Messages */}
            <div
              className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
              aria-labelledby="searchDropdown"
            >
              <form className="form-inline mr-auto w-100 navbar-search">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control bg-light border-0 small"
                    placeholder="Search for..."
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="button">
                      <i className="fas fa-search fa-sm" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </li>
          {/* Nav Item - Alerts */}
          <li className="nav-item dropdown no-arrow mx-1">
            <div>
              <button
                type="button"
                className="nav-link dropdown-toggle"
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true"
                onClick={toggleNotifile}
              >
                <i className="fas fa-bell fa-fw" />
                {/* Counter - Alerts */}
                <span className="badge badge-danger badge-counter">{listNotification?.filter(i => i.isRead === false).length.toString()}</span>
                {/* Add a caret icon here if you want */}
              </button>
            </div>
            {/* Dropdown - Alerts */}
            {notifileOpen && (
              <div
                className=" absolute rounded-md ring-opacity-5 dropdown-list bg-white dropdown-menu-right shadow animated--grow-in"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <div className="relative">
                  <h6 className="dropdown-header">Trung tâm thông báo</h6>
                  <span onClick={readAll} className="text-white absolute top-1 right-1 p-2 cursor-pointer" title="Đánh dấu tất cả là đã đọc">
                    <IoIosMailOpen />
                  </span>
                </div>
                {
                  listNotification
                    ?.sort((a, b) => {
                      // Chuyển đổi createdAt thành số nếu nó không phải là số
                      const createdAtA =
                        typeof a.createdAt === "number"
                          ? a.createdAt
                          : new Date(a.createdAt).getTime();
                      const createdAtB =
                        typeof b.createdAt === "number"
                          ? b.createdAt
                          : new Date(b.createdAt).getTime();
                      return createdAtB - createdAtA;
                    })
                    ?.slice(0, 5)
                    ?.map((item, i) => {
                      return (
                        <a key={i} title={!item.isRead ? 'Đánh dấu là đã đọc' : 'Đã đọc'} onClick={() => handleChangeIsRead(item?._id)} className={`dropdown-item ${item.isRead ? 'bg-white' : 'bg-blue-100'} d-flex align-items-center`} href="#">
                          <div className="mr-3">
                            <div className="icon-circle bg-primary text-white">
                              <SolutionOutlined />
                            </div>
                          </div>
                          <div>
                            <div className="small text-gray-500">{moment(item?.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                            <span className="font-medium">
                              {item?.title}
                            </span>
                          </div>
                        </a>
                      )
                    })
                }

                <div onClick={showMore}
                  className="dropdown-item text-center small  cursor-pointer"
                >
                  Hiển thị thêm
                </div>
              </div>
            )}
          </li>

          {/* Nav Item - Messages */}

          <div className="topbar-divider d-none d-sm-block"></div>
          {/* Nav Item - User Information */}
          <UserProfile />
        </ul>
      </nav>
      {/* End of Topbar */}
    </>
  );
};

export default AdminTopBar;
