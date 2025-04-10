import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UsersFile from "./UsersFile";
import { useDebounce } from "../../utils/debouce";
import { SearchApi } from "../../services/search";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/products";

const Header = () => {
  const btnMobile = useRef(null);
  const megaE = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const next = useNavigate();

  const cartQ = useSelector((state: { cart: any }) => state.cart.cartQuantity);

  const onClick = () => {
    if (btnMobile.current) {
      btnMobile.current.classList.toggle("hidden");
    }
  };

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (scrollY > lastScrollY && scrollY > 100) {
      megaE.current?.classList?.add("hidden");
    } else if (scrollY < lastScrollY) {
      megaE.current?.classList?.remove("hidden");
    }
    setLastScrollY(scrollY);
  }, [scrollY, lastScrollY]);

  // Lấy ra user sau khi đăng nhập thành công trong session
  const userSession = useMemo(() => {
    const session = sessionStorage.getItem("user");
    return session ? JSON.parse(session) : null;
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 700);

  useEffect(() => {
    // setInputChange(true)
    if (debouncedSearchTerm != "") {
      (async () => {
        try {
          const { data } = await SearchApi(debouncedSearchTerm);
          console.log(data)
          setSuggestions(data);
        } catch (error) {
          setSuggestions([{ name: error.response.data.message }]);
        }
      })();
    }
  }, [debouncedSearchTerm]);
  // console.log(suggestions)

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (!value) {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    setSuggestions([]);
    setSearchTerm("");
    next("/products/detail/" + item._id);
  };

  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState("");

  useEffect(() => {
    // console.log("Location pathname:", location.pathname);
    const pathname = location.pathname;
    // Xác định mục menu tương ứng dựa trên đường dẫn URL hiện tại
    let menuItem = "";
    if (pathname === "/") {
      menuItem = "home";
    } else if (pathname === "/products") {
      menuItem = "products";
    } else if (pathname === "/voucher") {
      menuItem = "voucher";
    } else if (pathname === "/blog") {
      menuItem = "blog";
    } else if (pathname === "/contact") {
      menuItem = "contact";
    }
    // Cập nhật trạng thái của mục menu được nổi bật
    setActiveMenuItem(menuItem);
  }, [location]);

  return (
    <header
      ref={megaE}
      className=" w-full fixed top-0 z-50 transition-all duration-700  ease-in-out "
    >
      <nav className=" border-gray-200 bg-white">
        <div
          ref={megaE}
          className={
            " xl:flex md:block hidden justify-between px-2 w-full h-[45px] bg-[#2e2f31e5] "
          }
        >
          <ul className="flex xl:block md:hidden xl:my-4 ">
            <div className="flex justify-center gap-3 text-white ml-3">
              <li className="group flex ">
                <Link
                  to=""
                  className="flex items-center gap-2 uppercase font-normal text-sm hover:text-white"
                >
                  <i className="fa-solid fa-location-dot"></i>Location
                </Link>
                <ul className="absolute hidden group-hover:block bg-black mt-1 p-2 px-3 rounded-md z-20 transition-all duration-500 left-0 top-12">
                  <div className="absolute -translate-y-5 translate-x-12 ">
                    <i className="fa-solid fa-caret-down fa-rotate-180 text-black"></i>
                  </div>
                  <div className="text-sm">Số 39 Đức Diễn, Phúc Diễn, Bắt Từ Liêm, Hà Nội.
                    <li>
                      {/* <Link to=""></Link> */}
                    </li>
                  </div>
                </ul>
              </li>
              <li className="group flex">
                <Link
                  to=""
                  className="flex justify-items-center items-center gap-2 uppercase font-normal text-sm hover:text-white"
                >
                  <i className="fa-regular fa-envelope"></i>Email
                </Link>
                <ul className="absolute hidden group-hover:block bg-black mt-1 p-2 px-3  text-white rounded-md z-20 left-13 top-12">
                  <div className="absolute -translate-y-5 translate-x-6 ">
                    <i className="fa-solid fa-caret-down fa-rotate-180 text-black"></i>
                  </div>
                  <div className="text-sm">
                    <li>
                      <Link to="">BossHouse@gmail.com</Link>
                    </li>
                  </div>
                </ul>
              </li>
              <li className="group flex">
                <Link
                  to=""
                  className="flex items-center gap-2 uppercase font-normal text-sm hover:text-white"
                >
                  <i className="fa-solid fa-phone"></i>0366.292.585
                </Link>
                <ul className="absolute hidden group-hover:block bg-black mt-1 p-2 px-3  text-white rounded-md z-20 left-13 top-12">
                  <div className="absolute -translate-y-5 translate-x-6 text-black">
                    <i className="fa-solid fa-caret-down fa-rotate-180"></i>
                  </div>
                  <div className="text-sm">
                    <li>
                      <Link to="">0366.292.585</Link>
                    </li>
                  </div>
                </ul>
              </li>
            </div>
          </ul>

          <div className="text-white px-1 text-sm flex  w-7/12 xl:block xl:my-4 md:my-0 md:hidden">
            <Marquee speed={50} gradient={false} pauseOnHover={true}>
              <Marquee pauseOnHover={true}>
                Thú Cưng Hạnh Phúc, Bạn An Tâm: Muốn Tìm Thức Ăn Chất Lượng Hãy
                Đến Với Ngôi Nhà Thú Cưng BossHouse Của Chúng Tôi
              </Marquee>
            </Marquee>
          </div>
          <div
            className="relative xl:flex md:block hidden flex-row-reverse gap-2 justify-center items-center pr-6 "
            style={{ transition: "all 0.3s", animation: "fadeIn 0.5s" }}
          >
            <button className="ml-2 ">
              <Link
                to="/cart"
                className="bg-[white] relative p-[7px] px-[10px] rounded-md mr-2 cursor-pointer xl:block md:block hidden  "
              >
                <i className="fa-solid fa-cart-shopping text-base"></i>
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-2 text-xs text-white">
                  {cartQ}
                </span>
              </Link>
            </button>
            <Link
              to="#"
              className="bg-[white] xl:block md:hidden p-[6px] px-[10px] rounded-md mr-2 cursor-pointer "
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="fa-solid fa-magnifying-glass text-base"></i>
            </Link>
            {showSearch && (
              <div
                className="right-0 bg-white rounded-md shadow-md relative"
                style={{ transition: "all 0.8s", animation: "fadeIn 0.5s" }}
              >
                <input
                  type="text"
                  value={searchTerm}
                  autoFocus
                  placeholder="Tìm kiếm..."
                  className="border border-gray-300 h-9  rounded-md px-1"
                  onChange={handleInputChange}
                />

                {debouncedSearchTerm && (
                  <ul className="suggestion-list absolute z-[1000] mt-1 ">
                    {suggestions.map((item, index) => {
                      // console.log(item)
                      return (
                        // <Link to={`/detail/${item?._id}`}>
                        <li
                          key={index}
                          className="suggestion-item  bg-black/70 hover:bg-blue-400 text-white min-w-[300px]  py-1 px-2 cursor-pointer transition"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <div className="flex item-center justify-between py-2 px-2">
                            <div className="flex items-center">
                              {item?.name && item?.images ? (
                                <img
                                  src={
                                    item?.images?.[0]?.response?.urls?.[0] || ""
                                  }
                                  alt="img"
                                  className="w-[50px] rounded-full"
                                />
                              ) : undefined}
                              <div className="text-sm ml-2">{item?.name}</div>
                            </div>

                            {/* <div className="text-sm flex items-center">
                              Giá:
                              <span className="text-base font-semibold">
                                {formatCurrency(item?.sizes[0]?.price)}
                              </span>
                            </div> */}
                          </div>
                        </li>
                        // </Link>
                      );
                    })}
                    <Link to="/products">
                      <div className="bg-black/70 hover:bg-blue-400 text-white border-t-[1px] py-2 px-4 ">
                        <div className="transition-all hover:translate-x-5 hover:delay-125 duration-300">
                          Xem tất cả
                          <i className="fa-solid fa-arrow-right ml-3"></i>
                        </div>
                      </div>
                    </Link>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#ffffffce] px-4 py-2  flex flex-wrap items-center justify-between max-w-full mx-auto  shadow-xl md:mx-2   xl:p-1 ">
          <Link
            to="/"
            className="flex items-center space-x-3  rtl:space-x-reverse"
          >
            <img className="h-[60px] " src="/images/logo.png" alt="" />
          </Link>
          {/* {userSession} */}
          <div className="flex items-center md:order-2  space-x-0 md:space-x-2 rtl:space-x-reverse">
            <Link
              to="#"
              className="bg-[white] xl:hidden block p-[6px] px-[10px] rounded-md mr-2 cursor-pointer "
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="fa-solid fa-magnifying-glass text-base"></i>
            </Link>
            {showSearch && (
              <div
                className="right-0 bg-white xl:hidden block rounded-md shadow-md relative"
                style={{ transition: "all 0.8s", animation: "fadeIn 0.5s" }}
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm kiếm..."
                  className="border border-gray-300 h-9  rounded-md px-1"
                  onChange={handleInputChange}
                />

                {debouncedSearchTerm && (
                  <ul className="suggestion-list absolute z-[1000] mt-1 overflow-y-scroll">
                    {suggestions.map((item, index) => {
                      // console.log(item)
                      return (
                        // <Link to={`/detail/${item?._id}`}>
                        <li
                          key={index}
                          className="suggestion-item  bg-black/70 hover:bg-blue-400 text-white min-w-[300px]  py-1 px-2 cursor-pointer transition"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <div className="flex item-center justify-between py-2 px-2">
                            <div className="flex items-center">
                              {item?.name && item?.images ? (
                                <img
                                  src={
                                    item?.images?.[0]?.response?.urls?.[0] || ""
                                  }
                                  alt="img"
                                  className="w-[50px] rounded-full"
                                />
                              ) : undefined}
                              <div className="text-sm ml-2">{item?.name}</div>
                            </div>

                            {/* <div className="text-sm flex items-center">
                              Giá:
                              <span className="text-base font-semibold">
                                {formatCurrency(item?.sizes[0]?.price)}
                              </span>
                            </div> */}
                          </div>
                        </li>
                        // </Link>
                      );
                    })}
                    <Link to="/products" >
                      <div className="bg-black/70 hover:bg-blue-400 text-white border-t-[1px] py-2 px-4 ">
                        <div className="transition-all hover:translate-x-5 hover:delay-125 duration-300">
                          Xem tất cả
                          <i className="fa-solid fa-arrow-right ml-3"></i>
                        </div>
                      </div>
                    </Link>
                  </ul>

                )}
              </div>
            )}
            {userSession ? (
              <UsersFile />
            ) : (
              <>
                <Link
                  to="/signin"
                  className="shadow-xl xl:text-gray-900  xl:bg-[#f5f5f5] xl:hover:bg-gray-50 focus:ring-4 xl:ring-gray-300 font-medium rounded-lg xl:text-sm text-xs px-4 py-2 md:px-5 md:py-2.5  focus:outline-none  md:bg-blue-700 md:text-white xl:mt-0 md:mt-2  "
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/signup"
                  className="shadow-xl text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg xl:text-sm text-xs px-4 py-2 md:px-5 md:py-2.5  focus:outline-none  xl:block md:hidden "
                >
                  Đăng Ký
                </Link>
              </>
            )}

            <button
              onClick={onClick}
              data-collapse-toggle="mega-menu-icons"
              type="button"
              className=" inline-flex items-center p-2 w-10 h-10 justify-center text-sm  rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
              aria-controls="mega-menu-icons"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            ref={btnMobile}
            id="mega-menu-icons"
            className=" items-center justify-between hidden w-full  md:flex md:w-auto md:order-1 text-right"
          >
            <ul className="flex flex-col mt-2 xl:text-sm text-sm md:flex-row md:mt-0 xl:space-x-8 md:space-x-3 rtl:space-x-reverse ">
              <Link
                to="/"
                className={`font-bold  block py-2.5 xl:px-3  hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0 ${activeMenuItem === "home" ? "text-blue-600" : ""
                  }`}
              >
                TRANG CHỦ
              </Link>
              <li className="group">
                <Link
                  to="/products"
                  className={`font-bold  block py-2.5 xl:px-3  hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0 ${activeMenuItem === "products" ? "text-blue-600" : ""
                    }`}
                >
                  SẢN PHẨM
                </Link>
              </li>
              <li className="group">
                <Link
                  to="/voucher"
                  className={`font-bold  block py-2.5 xl:px-3  hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0 ${activeMenuItem === "voucher" ? "text-blue-600" : ""
                    }`}
                >
                  MÃ GIẢM GIÁ
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className={`font-bold  block py-2.5 xl:px-3  hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0 ${activeMenuItem === "blog" ? "text-blue-600" : ""
                    }`}
                >
                  TIN TỨC
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`font-bold  block py-2.5 xl:px-3  hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0 ${activeMenuItem === "contact" ? "text-blue-600" : ""
                    }`}
                >
                  LIÊN HỆ
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="font-bold  xl:hidden md:hidden block py-2.5 xl:px-3   hover:text-blue-600 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0  "
                >
                  <i className="fa-solid fa-cart-shopping text-base"></i>
                  <span className="absolute top-[278px] right-3 border flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-2 text-xs text-white">
                    {cartQ}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default memo(Header);
