import React, { useState, useEffect } from "react";
import type { MenuProps } from "antd";
import { Dropdown, Button, Space, Menu, Pagination } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../../utils/products";
import { getAllCategory } from "../../../../services/categories";
import { getAll, getProductsNoPaginate } from "../../../../services/products";
import clsx from "clsx";
import { useGetAllSoldProduct } from "../../../../hooks/apis/soldProduct";
import { motion } from "framer-motion";
import { useCategoryNoPaginate } from "../../../../hooks/apis/category";
import { useProductsNoPaginate } from "../../../../hooks/apis/products";
import { Skeleton, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { setRepuchaseListProductChecked } from "../../../../redux/slices/Cart";

const ProductList = () => {
  const [category, setCategory] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsInit, setProductsInit] = useState([]);
  const [pageSize, setPageSize] = useState(8);
  const [sortingOption, setSortingOption] = useState("Sắp xếp theo");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSlideMenuOpen, setMenu] = useState(false);
  const [totalProduct, setTotalProduct] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: listProductNoPaginate, isLoading: isProductLoading } = useProductsNoPaginate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setRepuchaseListProductChecked([]))
  }, []);

  useEffect(() => {
    setProducts(listProductNoPaginate?.data)
    setProductsInit(listProductNoPaginate?.data)

    setTotalProduct(listProductNoPaginate?.data?.length)
  }, [listProductNoPaginate]);


  const onShowSizeChange = (current, pageSize) => {
    setCurrentPage(current);
    setPageSize(pageSize);
    if (pageSize < products) {
      setProducts(products.slice(0, pageSize))
    }

    if (selectedCategory) {
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newData = listProductNoPaginate?.data?.filter(i => i.categoryId == selectedCategory)?.slice(startIndex, endIndex);
      setProducts(newData);
    } else {
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newData = listProductNoPaginate?.data?.slice(startIndex, endIndex);
      setProducts(newData);
    }
  };

  const { data: listCategoryNoPaginate, isLoading: isCategoryLoading } = useCategoryNoPaginate()
  useEffect(() => {
    setCategory(listCategoryNoPaginate?.data)
    // console.log(isCategoryLoading);
    if (isCategoryLoading) {
      console.log("Loading");
    }

  }, [listCategoryNoPaginate]);

  // Hàm sắp xếp
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    let newOption = "";
    if (e.key === "max") {
      const minPrice = [...products]?.sort(
        (a, b) => b.sizes[0]?.price - a.sizes[0]?.price
      );
      setProducts(minPrice);
      newOption = "Giá cao nhất";
    } else if (e.key === "min") {
      const maxPrice = [...products]?.sort(
        (a, b) => a.sizes[0]?.price - b.sizes[0]?.price
      );
      setProducts(maxPrice);
      newOption = "Giá thấp nhất";
    } else if (e.key === "newest") {
      const newestProducts = [...products]?.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      });
      setProducts(newestProducts);
      newOption = "Mới nhất";
    } else if (e.key === "oldest") {
      const oldestProducts = [...products]?.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        return 0;
      });
      setProducts(oldestProducts);
      newOption = "Cũ nhất";
    }
    setSortingOption(newOption);
  };

  const items: MenuProps["items"] = [
    {
      label: "Giá cao nhất",
      key: "max"
      // icon: <UserOutlined />,
    },
    {
      label: "Giá thấp nhất",
      key: "min"
    },
    {
      label: "Mới nhất",
      key: "newest"
      // icon: <UserOutlined />,
    },
    {
      label: "Cũ nhất",
      key: "oldest"
    }
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, [products]);

  // Hàm xử lý khi click vào thẻ label
  const handleCategoryChange = (categoryId) => {
    setCurrentPage(1);
    setSelectedCategory(categoryId);

    // Lọc danh sách sản phẩm theo ID của danh mục được chọn
    const filteredProducts = categoryId
      ? listProductNoPaginate?.data?.filter((item) => item.categoryId === categoryId)
      : products;

    setProducts(filteredProducts);
    setProductsInit(filteredProducts)
    setTotalProduct(filteredProducts?.length)

    if (!categoryId) {
      setProducts(listProductNoPaginate?.data)
      setProductsInit(listProductNoPaginate?.data)
      setTotalProduct(listProductNoPaginate?.data?.length)
    }
  };

  // Bán chạy
  const [listSoldProduct, setListSoldProduct] = useState([]);
  const { data: listSoldP, isLoading: isSoldProductLoading } = useGetAllSoldProduct();
  useEffect(() => {
    setListSoldProduct(
      listSoldP?.data
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5)
    );
  }, [listSoldP]);
  // console.log(listSoldProduct)

  return (
    <>
      <div className="w-full flex flex-col items-center mt-4">
        <div className=" w-full my-1 lg:my-3 ">
          <div className="pt-5 pb-4 flex flex-col gap-5  justify-between  lg:flex-row">
            <div className="flex items-center gap-3">
              <p className="text-black font-medium cursor-pointer">
                <Link to="/">Trang chủ</Link>
              </p>
              <span className="text-sm text-gray-400">
                <i className="fas fa-chevron-right"></i>
              </span>
              <p className="text-black font-bold cursor-pointer">Sản phẩm</p>
            </div>
            <div className="block lg:hidden">
              <button
                className="flex items-center gap-2 text-black cursor-pointer "
                onClick={() => setMenu(true)}
              >
                <i className="fa-solid fa-sliders"></i>
                <span className="text-lg font-bold">Danh mục</span>
              </button>
            </div>
            <div className="flex items-center text-black text-sm tracking-widest gap-2 ">
              <span className="text-sm font-medium font-sans">
                {isProductLoading ? (
                  <Skeleton width={200} height={28} />
                ) : (
                  `Tất cả ${totalProduct || 0} sản phẩm`
                )}
              </span>
              <div className="flex items-center ">
                <Dropdown overlay={<Menu {...menuProps} />} trigger={["click"]}>
                  <Button>
                    <Space>
                      {sortingOption}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
        {/* shop wrapper */}
        <hr />
        {/* sidebar mobile category */}
        <section
          className={clsx(
            "fixed z-999  h-full border w-full lg:hidden bg-black/50 backdrop-blur-sm top-0 right-0 -translate-x-full transition-all duration-500",
            isSlideMenuOpen && "translate-x-0"
          )}
        >
          <div className=" text-black bg-white flex-col absolute left-0 top-0 h-full pt-24 px-3 gap-8 w-80 overflow-y-scroll overscroll-contain">
            <div className="ml-64 text-right fixed">
              <i
                className="fa-solid fa-close text-xl  bg-white text-[red] px-3 py-2 rounded-[100%] cursor-pointer "
                onClick={() => setMenu(false)}
              ></i>
            </div>
            <div className="divide-y divide-gray-200 space-y-5">
              <div className="border-blue-400 border-[0.5px]">
                <h3 className="bg-blue-400 px-3 py-2  text-xl text-white  uppercase font-bold">
                  Danh mục sản phẩm
                </h3>
                <div className="divide-y divide-gray-200 px-3">

                  {isCategoryLoading ? (<>

                    {
                      [...Array(7)].map((index) => (
                        <div key={index}>
                          <Typography className="flex my-3">
                            <Skeleton variant="rectangular" width={20} height={20} className="mr-2" />
                            <Skeleton variant="text" width={'90%'} height={22} />
                          </Typography>
                        </div>
                      ))
                    }


                  </>) : (
                    <>
                      <label className="flex items-center py-2 transition-all hover:translate-x-2 hover:delay-125 duration-300">
                        <input
                          type="checkbox"
                          name="category"
                          value="all"
                          checked={!selectedCategory}
                          onChange={() => handleCategoryChange(null)}
                          className="focus:ring-0 rounded-sm cursor-pointer"
                        />
                        <span className="text-gray-900 ml-1 font-semibold cursor-pointer">
                          Tất cả
                        </span>
                      </label>
                      {category
                        ?.filter((item) => item?.products?.length > 0)
                        ?.sort((a, b) => b.products.length - a.products.length)
                        ?.map((item: any, index: number) => {
                          // console.log(item)
                          return (
                            <label
                              key={index}
                              className="flex items-center py-2 transition-all hover:translate-x-2 hover:delay-125 duration-300"
                            >

                              <input
                                type="checkbox"
                                name="category"
                                value={item._id}
                                checked={selectedCategory === item._id}
                                onChange={() => handleCategoryChange(item._id)}
                                className="focus:ring-0 rounded-sm cursor-pointer"
                              />
                              <span className="text-gray-900 ml-1 cursor-pointer font-semibold ">
                                {item.name} [{item?.products?.length}]
                              </span>
                            </label>
                          )
                        })}
                    </>
                  )}

                </div>
              </div>

              {/* Ảnh */}
              {/* <div className="mt-2 border">
                <img
                  src="https://images.unsplash.com/photo-1565674244283-993fb27a215f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D"
                  alt=""
                  className="h-72 w-full object-fill"
                />
              </div> */}

              <div className="mt-[10px] bg-blue-400 px-3 py-3 font-bold uppercase">
                <h4>Top sản phẩm bán chạy</h4>
              </div>
              <div className=" divide-y divide-gray-200  pb-11">
                {isSoldProductLoading ? (<>
                  {[...Array(5)].map((index) => (
                    <div key={index} className="flex bg-white shadow h-auto border my-2 overflow-hidden">

                      <div className=" py-2 px-1 w-24 ">
                        <Skeleton variant="rectangular" height={'100%'} />
                      </div>
                      <Typography className="w-full m-2">
                        <Skeleton variant="text" />
                        <Skeleton />
                        <Skeleton />
                      </Typography>
                    </div>
                  ))}

                </>
                ) : (
                  <>
                    {listSoldProduct?.map((item: any, i: number) => (
                      <Link to={`/product/detail/${item?.productId}`} key={i}>
                        <div className="flex  bg-white shadow h-auto border my-2 overflow-hidden   ">
                          <div className=" overflow-hidden py-2 px-1 w-24">
                            <img
                              src={
                                item?.product?.images[0].response.urls[0] ||
                                "https://static.thenounproject.com/png/504708-200.png"
                              }
                              alt="images"
                              className="object-cover "
                            />
                          </div>
                          <div className="pt-2  pr-1 w-48">
                            <h4 className="font-medium text-base mb-2 text-gray-800 hover:text-red-600 transition">
                              {item.name}
                            </h4>
                            <div className="mb-1">
                              <h3 className="font-bold">{item?.product?.name}</h3>

                              <span className="text-[#00000083] text-sm font-medium block">
                                Đã bán: {item?.quantitySold}
                              </span>

                              <span className="text-[#00000083] text-sm font-medium block">
                                Còn lại: {item?.product?.sizes?.reduce((a, b) => a + b.quantity, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
              <div className="row w-[100%] relative mt- mb-10 z-0 ">
                <div className="col">
                  <div className="flex  border-b-[#3257a8] border-b-2 uppercase justify-center items-center" >
                    <div className="bg-[#1969d3] flex flex-col font-bold text-white px-5 pt-3 pb-1 rounded-t-xl" >
                      <span>Địa chỉ</span>
                    </div>
                  </div>
                  <div className="tab-panels flex-grow">
                    <div className=" p-4">
                      <p className="text-justify">
                        <span className="font-medium text-[#ff00ff] text-xl">Cửa hàng mua đồ chó gần đây. Shop bán đồ dùng cho chó giá rẻ?</span>
                      </p>
                      <div className="text-justify  font-thin text-base ">
                        <ul className="  ml-2 my-1">
                          <li className="list-disc "><a href="https://goo.gl/maps/gn1onZF1NpjkrJ8c6">233 đường Đức Diễn , phường Phúc Diễn, Bắt Từ Liêm, Tp Hà Nội</a>. (Hẻm Xe Hơi lớn đỗ cửa).</li>
                          <li className="list-disc my-1"><a href="https://goo.gl/maps/pyiwAUo5RefzY23z8">Số 81-95, đường Nghi Tàm, phường Yên Phụ, quận Tây Hồ, Tp Hà Nội</a>.</li>
                        </ul>
                        <p className="">
                          <span dir="auto">Điện thoại: <a href="tel:0366292585">0366292585</a></span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* sidebar mobile category end */}

        <div className=" grid grid-cols-4 gap-6 items-start">
          {/* sidebar */}
          <div className="hidden col-span-1 bg-white shadow overflow-hidden lg:block ">
            <div className="divide-y divide-gray-200 space-y-5">
              <div className="border-blue-400 border-[0.5px]">
                <h3 className="bg-blue-400 px-3 py-2  text-base text-white  uppercase font-bold">
                  Danh mục sản phẩm
                </h3>
                <div
                  className="divide-y divide-gray-200 px-3 text-sm font-bold"
                  aria-labelledby="mega-menu-icons-dropdown-button"
                >
                  {isCategoryLoading ? (<>

                    {
                      [...Array(7)].map((index) => (
                        <div key={index}>
                          <Typography className="flex my-3">
                            <Skeleton variant="rectangular" width={20} height={20} className="mr-2" />
                            <Skeleton variant="text" width={'90%'} height={22} />
                          </Typography>
                        </div>
                      ))
                    }


                  </>) : (
                    <>

                      <label className="flex items-center py-2 transition-all hover:translate-x-2 hover:delay-125 duration-300">
                        <input
                          type="checkbox"
                          name="category"
                          value="all"
                          checked={!selectedCategory}
                          onChange={() => handleCategoryChange(null)}
                          className="focus:ring-0 rounded-sm cursor-pointer"
                        />
                        <span className="text-gray-900 ml-2 cursor-pointer">
                          Tất cả
                        </span>
                      </label>
                      {category
                        ?.filter((item) => item?.products?.length > 0)
                        ?.sort((a, b) => b.products.length - a.products.length)
                        ?.map((item: any, index: number) => (
                          <label
                            key={index}
                            className="flex items-center py-2 transition-all hover:translate-x-2 hover:delay-125 duration-300"
                          >
                            <input
                              type="checkbox"
                              name="category"
                              value={item._id}
                              checked={selectedCategory === item._id}
                              onChange={() => handleCategoryChange(item._id)}
                              className="focus:ring-0 rounded-sm cursor-pointer"
                            />
                            <span className="text-gray-900 ml-2 cursor-pointer  ">
                              {item.name} ({item?.products?.length})
                            </span>
                          </label>
                        ))}
                    </>
                  )}
                </div>

              </div>
            </div>
            {/* <div className="mt-2 border">
              <img
                src="https://images.unsplash.com/photo-1565674244283-993fb27a215f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D"
                alt=""
                className="h-72 w-full object-fill"
              />
            </div> */}
            <div className="mt-2 bg-blue-400 px-3 py-3 font-bold uppercase">
              <h4 className="text-white">Top sản phẩm bán chạy</h4>
            </div>
            <div className=" divide-y divide-gray-200 ">
              {isSoldProductLoading ? (<>
                {[...Array(5)].map((index) => (
                  <div key={index} className="flex bg-white shadow h-auto border my-2 overflow-hidden">

                    <div className=" py-2 px-1 w-24 ">
                      <Skeleton variant="rectangular" height={'100%'} />
                    </div>
                    <Typography className="w-full m-2">
                      <Skeleton variant="text" />
                      <Skeleton />
                      <Skeleton />
                    </Typography>
                  </div>
                ))}

              </>
              ) : (
                <>
                  {listSoldProduct?.map((item: any, i: number) => (
                    <Link to={`/products/detail/${item?.productId}`} key={i}>
                      <div className="flex  bg-white shadow h-24  overflow-hidden   ">
                        <div className=" overflow-hidden py-2 px-1 w-24">
                          <img
                            src={
                              item?.product?.images[0].response.urls[0] ||
                              "https://static.thenounproject.com/png/504708-200.png"
                            }
                            alt="images"
                            className="object-cover "
                          />
                        </div>
                        <div className="pt-2 pl-2 pr-1 w-48">
                          <h4 className="font-medium text-base mb-2 text-gray-800 hover:text-red-600 transition">
                            {item.name}
                          </h4>
                          <div className="mb-1">
                            <h3 className="font-bold">{item?.product?.name}</h3>

                            <span className="text-[#00000083] text-sm font-medium block">
                              Đã bán: {item?.quantitySold}
                            </span>

                            <span className="text-[#00000083] text-sm font-medium">
                              còn lại: {item?.product.sizes.reduce((a, b) => a + b.quantity, 0)}
                            </span>

                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
          {/* sidebar end */}
          <div className="col-span-10 lg:col-span-3 ">
            <div className="xl:ml-0  shadow-lgmt-2 mb-4 leading-7 flex items-center justify-between ">
              <span className="border-b-2 lg:w-[39%] w-[20%] border-[#000]"></span>
              <h1 className="lg:text-xl text-sm font-normal text-white uppercase bg-gray-900 lg:px-4 lg:py-4 px-5 py-2 rounded-3xl">
                SẢN PHẨM
              </h1>
              <span className="border-b-2 lg:w-[39%] w-[20%] border-[#000]"></span>
            </div>
            {/* product grid */}
            <div className="flex items-center justify-center">

              {/* item 1 */}
              {isProductLoading ? (<>
                <div className="grid grid-cols-2 md:grid-cols-2 mx-2 lg:grid-cols-4 xl:grid-cols-4 xl:gap-4 gap-3 mt-3">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="xl:relative overflow-hidden shadow rounded">
                      <Skeleton variant="rounded" width={200} height={200} className="" />
                      <Typography className="pt-1 px-3">
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </Typography>
                      <Skeleton className="mx-3 py-3" />
                    </div>
                  ))}
                </div>
              </>) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 mx-2 lg:grid-cols-4 xl:grid-cols-4 xl:gap-4 gap-2 mt-3">
                    {products?.length > 0
                      && products
                        ?.filter((i) => i.isActive === true)
                        ?.slice(0, pageSize)
                        .map((item: any, i: number) => (
                          <Link to={`/products/detail/${item?._id}`} key={i}>
                            <div className="xl:relative shadow rounded hover:scale-105 duration-500 ">
                              <div className=" rounded-xs p-2 lg:w-full">
                                <img
                                  src={
                                    item?.images[0]?.response?.urls[0] ||
                                    "https://static.thenounproject.com/png/504708-200.png"
                                  }
                                  alt="images"
                                  className="object-cover lg:w-full w-full lg:h-52 h-28  rounded-xl hover:scale-105 delay-150 duration-500"
                                />
                              </div>
                              <div className="pt-1 px-3">
                                <h4 className="capitalize font-semibold  h-14  xl:text-base text-xs mb-1 text-black hover:text-blue-500">
                                  {item.name}
                                </h4>
                                <div className="flex items-baseline justify-center mb-1 space-x-2 xl:text-base  text-sm">
                                  <p className="xl:text-lg  text-red-600 font-semibold">

                                    {/* giá thấp nhất - giá cao nhất */}
                                    {formatCurrency(
                                      item?.sizes?.reduce(
                                        (min, p) => (p.price < min ? p.price : min),
                                        item?.sizes[0]?.price
                                      )
                                    )}  {
                                      item?.sizes.length > 1 ? (' - ' + formatCurrency(
                                        item?.sizes?.reduce(
                                          (max, p) => (p.price > max ? p.price : max),
                                          item?.sizes[0]?.price
                                        )
                                      )
                                      ) : undefined
                                    }
                                  </p>
                                </div>
                              </div>
                              <a
                                href="#"
                                className=" bg-[#000000b6] text-white py-1 rounded-lg xl:text-base text-sm font-semibold hover:bg-blue-300 focus:scale-95 transition-all duration-200 ease-out flex items-center justify-center m-2"
                              >
                                Xem ngay
                              </a>

                              {/* Hết hàng */}
                              {item?.sizes?.every(s => s.quantity === 0) && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                                  // whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.7)" }}
                                  className="absolute top-16 left-[65px] z-10 text-white font-semibold px-3 py-1 text-sm bg-black/50  rounded-full w-[100px] h-[100px] flex items-center justify-center"
                                  style={{ zIndex: 10 }} // Đảm bảo chữ nổi lên trên cùng
                                >
                                  <motion.span
                                  // animate={{ opacity: [0, 1] }} // Tạo hiệu ứng nhấp nháy
                                  // transition={{ duration: 0.5, repeat: Infinity }} // Lặp vô hạn
                                  >
                                    Hết hàng
                                  </motion.span>
                                </motion.div>
                              )}
                            </div>
                          </Link>
                        ))
                    }
                  </div>
                </>
              )}
            </div>
            {/* product grid end */}
          </div>
          {/* product end */}
        </div>
        <div className="flex items-center justify-center md:ml-80 mb-6 md:mb-1 mt-[50px]">
          {" "}
          {/* <Pagination
            onChange={onShowSizeChange}
            defaultCurrent={1}
            total={totalDocs}
          /> */}
          <Pagination
            showSizeChanger
            onChange={onShowSizeChange}
            current={currentPage}
            defaultPageSize={8}
            total={productsInit?.length}
          />
          {" "}
        </div>
      </div >
    </>
  );
};

export default ProductList;