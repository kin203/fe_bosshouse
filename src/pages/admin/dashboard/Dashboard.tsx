import { useEffect, useState } from "react";
import { getAllOrderNoPaginate, getOrders } from "../../../services/order";
import { DatePicker } from "antd";
import { formatCurrency } from "../../../utils/products";
import { CalendarOutlined } from "@ant-design/icons";
import { Line, Pie, Bar } from "react-chartjs-2";
import { FaCircleUser } from "react-icons/fa6";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,

  ArcElement,
  Tooltip,
  Legend,

  BarElement
} from "chart.js";
import { getAllContact } from "../../../services/contact";
import { Link } from "react-router-dom";
import { getAllBlog } from "../../../services/blog";
import moment from "moment";
import { getAllCategory } from "../../../services/categories";
import { getAllUsers } from "../../../services/users";
import { useUsers } from "../../../hooks/apis/users";
import { useGetAllSoldProduct } from "../../../hooks/apis/soldProduct";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend, BarElement);

// Định nghĩa kiểu dữ liệu cho các đối tượng UserTotal
interface UserTotal {
  name: string;
  phoneNumber: number
  totalPrice: number;
}

const Dashboard = () => {
  const [dataOrder, setDataOrder] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [yearRevenue, setYearRevenue] = useState({});
  const [profitByMonth, setProfitByMonth] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [dateString, setDateString] = useState(null);
  const [totalContact, setTotalContact] = useState(0);
  const [blog, setBlog] = useState([]);
  const [category, setCategory] = useState([]);
  const [yearChance, setYearChance] = useState(new Date().getFullYear().toString());
  const [users, setUsers] = useState([])
  const { data: listUser } = useUsers()

  useEffect(() => {
    setUsers(listUser?.data)
  }, [listUser]);

  useEffect(() => {
    setLoading(true)
    try {
      const fetchCategory = async () => {
        const res = await getAllCategory({ page: 1 })
        setCategory(res.data.docs)
        setLoading(false)
      }
      fetchCategory()
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    setLoading(true)
    try {
      const fetchBlog = async () => {
        const res = await getAllBlog({ page: 1 })
        setBlog(res.data.docs)
        setLoading(false)
      }
      fetchBlog()
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }, []);

  useEffect(() => {
    try {
      const fetchContact = async () => {
        const res = await getAllContact({ page: 1 });
        setTotalContact(res?.data?.docs?.length);
      };
      fetchContact();
    } catch (error) {
      console.log(error);
    }
  });

  // Bán chạy
  const [listSoldProduct, setListSoldProduct] = useState([])
  const { data: listSoldP } = useGetAllSoldProduct()
  // console.log(listSoldProduct)
  useEffect(() => {
    setListSoldProduct(listSoldP?.data.sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 7))
  }, [listSoldP]);

  // Doanh thu tháng và năm
  useEffect(() => {
    const defaultDateString = `0${new Date().getMonth() + 1
      }-${new Date().getFullYear()}`;
    setDateString(defaultDateString);
  }, []);

  const data = {
    labels: Object.keys(monthlyRevenue),
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: Object.values(monthlyRevenue),
        backgroundColor: "rgba(75,19,192,0.2)", // Màu nền của biểu đồ
        borderColor: "blue",// Màu đường viền của biểu đồ
        borderWidth: 1, // Độ rộng của đường viền
        pointBorderColor: "rgba(75,192,192,1)", // Màu của điểm trên biểu đồ
        pointBackgroundColor: "#fff", // Màu nền của điểm trên biểu đồ
        pointBorderWidth: 4, // Độ rộng của viền điểm
        pointHoverRadius: 5, // Đường kính của điểm khi di chuột qua
        pointHoverBackgroundColor: "rgba(75,192,192,1)", // Màu nền của điểm khi di chuột qua
        pointHoverBorderColor: "rgba(220,220,220,1)", // Màu viền của điểm khi di chuột qua
        pointHoverBorderWidth: 2, // Độ rộng của viền điểm khi di chuột qua
        pointRadius: 2, // Đường kính của điểm
        pointHitRadius: 10, // Khoảng cách hit khi di chuột đến điểm
        tension: 0.4 // Độ giãn của đường
      }
    ]
  };

  const dataProfitByMonth = {
    labels: Object.keys(profitByMonth),
    datasets: [
      {
        label: "Lợi nhuận (VND)",
        data: Object.values(profitByMonth),
        backgroundColor: "rgba(75,19,192,0.2)", // Màu nền của biểu đồ
        borderColor: "blue",// Màu đường viền của biểu đồ
        borderWidth: 1, // Độ rộng của đường viền
        pointBorderColor: "rgba(75,12,192,1)", // Màu của điểm trên biểu đồ
        pointBackgroundColor: "#fff", // Màu nền của điểm trên biểu đồ
        pointBorderWidth: 4, // Độ rộng của viền điểm
        pointHoverRadius: 5, // Đường kính của điểm khi di chuột qua
        pointHoverBackgroundColor: "rgba(75,192,92,1)", // Màu nền của điểm khi di chuột qua
        pointHoverBorderColor: "rgba(220,220,220,1)", // Màu viền của điểm khi di chuột qua
        pointHoverBorderWidth: 2, // Độ rộng của viền điểm khi di chuột qua
        pointRadius: 2, // Đường kính của điểm
        pointHitRadius: 10, // Khoảng cách hit khi di chuột đến điểm
        tension: 0.4 // Độ giãn của đường
      }
    ]
  };

  const dataPieChart = {
    labels: Object.values(category).map(item => item.name),
    datasets: [
      {
        label: "Số lượng sản phẩm",
        data: Object.values(category).map(item => (item?.products ? item?.products?.length : 0)),
        backgroundColor: ["#48cae4", "#36A2EB", "#FFCE56", "#8A2BE2"],
        hoverBackgroundColor: ["#48cae4", "#36A2EB", "#FFCE56", "#8A2BE2"],
      }
    ],
  };

  const handleDateChange = (date, dateString: string) => {
    // console.log('Tháng:', dateString);
    setDateString(dateString);
    setValue(date);
  };

  useEffect(() => {
    document.title = "Thống kê chi tiết"
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchOrders = async () => {
      try {
        const resAll = await getAllOrderNoPaginate();
        setDataOrder(resAll?.data)
        const orders = resAll?.data?.filter(i => i?.products[0].status === 'Đã Nhận Hàng');
        // console.log(orders)

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const monthsOfYear = Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const monthString = month < 10 ? `0${month}` : `${month}`;
          return `${monthString}-${currentYear}`;
        });

        const revenueByMonth = {};
        const profitByMonth = {}
        const revenueByYear = {};

        monthsOfYear.forEach(monthKey => {
          revenueByMonth[monthKey] = 0; // Set doanh thu của mỗi tháng bằng 0 ban đầu
          profitByMonth[monthKey] = 0;
        });

        orders.forEach((order) => {
          // console.log(order)
          const date = new Date(order.createdAt);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const monthKey = `${month < 10 ? '0' + month : month}-${year}`;

          // if (revenueByMonth[monthKey] != undefined) {
          //   revenueByMonth[monthKey] += order.products.reduce(
          //     (total, product) => total + (product?.sizes[0]?.price || 0),
          //     0
          //   );
          // }
          if (revenueByMonth[monthKey] != undefined) {
            revenueByMonth[monthKey] += order?.totalPrice
          }

          if (profitByMonth[monthKey] != undefined) {
            profitByMonth[monthKey] += order.products.reduce((totalProfit, product) => {
              // Kiểm tra xem mỗi sản phẩm có thuộc tính initPriceProduct và initImportPriceProduct không
              if (product.initPriceProduct && product.initImportPriceProduct) {
                // Tính lợi nhuận của sản phẩm
                const profit = product.initPriceProduct - product.initImportPriceProduct;
                return totalProfit + profit;
              }
              return totalProfit;
            }, 0);
          }

          // Tính toán doanh thu theo năm
          // if (revenueByYear[year] !== undefined) {
          //   revenueByYear[year] += order.products.reduce(
          //     (total, product) => total + (product?.sizes[0]?.price || 0),
          //     0
          //   );
          // } else {
          //   revenueByYear[year] = order.products.reduce(
          //     (total, product) => total + (product?.sizes[0]?.price || 0),
          //     0
          //   );
          // }

          if (revenueByYear[year] !== undefined) {
            revenueByYear[year] += order?.totalPrice
          } else {
            revenueByYear[year] = order.totalPrice
          }
        });

        setMonthlyRevenue(revenueByMonth);
        setProfitByMonth(profitByMonth);
        setYearRevenue(revenueByYear);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateString]);
  // console.log(monthlyRevenue)
  // console.log(yearRevenue)
  // console.log(profitByMonth)


  const onChangeYear = (date, dateString) => {
    setYearChance(dateString);
  };


  const [topPrice, setTopPrice] = useState<[string, UserTotal][]>([]);

  useEffect(() => {
    const userTotal: { [userId: string]: UserTotal } = {};
    // Tính tổng totalPrice của mỗi userId và lưu tên của người dùng
    dataOrder?.filter(i => i.products[0].status == "Đã Nhận Hàng").forEach(order => {
      const userId = order.userId;
      if (!userTotal[userId]) {
        userTotal[userId] = {
          name: order.fullName,
          phoneNumber: order.phoneNumber,// Giả sử thông tin name được lưu trong đơn hàng
          totalPrice: 0
        };
      }
      userTotal[userId].totalPrice += order.totalPrice;
    });

    // Chuyển userTotal thành mảng để sắp xếp
    const top5Users: [string, UserTotal][] = Object.entries<UserTotal>(userTotal)
      .sort(([, a], [, b]) => b.totalPrice - a.totalPrice)
      .slice(0, 5);

    setTopPrice(top5Users);
  }, [dataOrder]);

  return (
    <>
      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {/* Main Content */}
        <div id="content">
          {/* Begin Page Content */}
          <div className="container-fluid">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Thống kê</h1>
              {/* <a
                href="#"
                className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
              >
                <i className="fas fa-download fa-sm text-white-50" /> Generate
                Report
              </a> */}
            </div>
            {/* Content Row */}
            <div className="row">
              {/* Earnings (Monthly) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Doanh thu tháng này {dateString}
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formatCurrency(monthlyRevenue[`${dateString}`] || 0)}
                        </div>
                      </div>
                      <div className="col-auto">
                        <div>
                          <DatePicker.MonthPicker
                            allowClear={false}
                            value={value}
                            onChange={handleDateChange}
                            placeholder="Chọn tháng"
                            format="MM-YYYY"
                            suffixIcon={<CalendarOutlined />}
                            style={{ width: "20px", paddingRight: "35px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings (Monthly) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                          Tổng doanh thu ( {yearChance} )
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {formatCurrency(yearRevenue[`${yearChance}`] || 0)}
                        </div>
                      </div>
                      <div className="col-auto text-[30px] text-gray-500">
                        {/* <FaMoneyBill1 /> */}
                        <DatePicker onChange={onChangeYear} picker="year" style={{ width: "20px", paddingRight: "35px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings (Monthly) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
              <Link to={"/admin/users"} className="text-decoration-none">
                <div className="card border-l-[#ccc] border-l-[5px] shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-gray-700 text-uppercase mb-1">
                          Số lượng người dùng
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {users?.length || 0}
                        </div>
                      </div>
                      <div className="col-auto text-[30px] text-gray-500">
                        <FaCircleUser />
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              </div>

              {/* Pending Requests Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <Link to={"/admin/contact"} className="text-decoration-none">
                  <div className="card border-left-warning shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                            Yêu cầu hỗ trợ
                          </div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {totalContact}
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-comments fa-2x text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Content Row */}
            <div className="row">
              {/* Area Chart */}
              <div className="col-xl-8 col-lg-7">
                <div className="card shadow mb-4">
                  {/* Card Header - Dropdown */}
                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Thống kê doanh thu theo tháng - 2024
                    </h6>
                  </div>
                  {/* Card Body */}
                  <div className="card-body">

                    <Line data={data} options={{
                      animation: {
                        duration: 1000, // Thời gian animation (milliseconds)
                        easing: 'linear' // Loại easing cho animation
                      },
                      hover: {
                        mode: 'nearest', // Chế độ hiển thị tooltip khi di chuột qua
                        intersect: true // Tooltip hiển thị khi di chuột qua các điểm dữ liệu
                      },
                      scales: {
                        x: {
                          display: true,
                          title: {
                            display: true,
                            text: 'Tháng'
                          },
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: 'black'
                          }
                        },
                        y: {
                          display: true,
                          title: {
                            display: true,
                            text: 'Đơn vị (VND)'
                          },
                          grid: {
                            color: 'gray'
                          },
                          ticks: {
                            color: 'black'
                          }
                        }
                      },
                      elements: {
                        line: {
                          cubicInterpolationMode: 'monotone' // Chọn cách nối dữ liệu để làm cho đường line mềm mại hơn
                        }
                      }
                    }}>
                    </Line>


                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="col-xl-4 col-lg-5">
                <div className="card shadow mb-4">
                  {/* Card Header - Dropdown */}
                  <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Tin tức mới nhất
                    </h6>
                  </div>
                  {/* Card Body */}
                  <div className="card-body p-0 px-3">
                    <div>
                      <ul>
                        {
                          blog?.slice(0, 4)?.map((item: any, index: number) => {
                            return (
                              <li key={index}>
                                <Link to={`/blogDetail/${item?._id}`}>
                                  <div className="flex gap-x-[12px] py-2">
                                    <div>
                                      <img className="w-[80px] h-[60px] object-cover mt-1"
                                        src={item.imageTitle}
                                        alt="img-blog"
                                      />
                                    </div>
                                    <div className="">
                                      <h3 className="font-semibold mt-1">{item?.title?.length > 30 ? item?.title?.slice(0, 30) + "..." : item?.title}</h3>
                                      <div className="text-[12px] mt-2">
                                        <p>
                                          Người đăng: {item?.author}
                                        </p>
                                        <p>
                                          Thời gian: {moment(item?.createdAt).format("hh:mm DD-MM-YYYY")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            )
                          })
                        }
                      </ul>
                      <Link to={"/blog"}>
                        <div className="text-center my-3">
                          <button className="font-medium hover:text-[blue] hover:underline">Xem thêm</button>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Content Row */}
            <div className="row">
              {/* Content Column */}
              <div className="col-lg-6 mb-4">
                {/* Project Card Example */}
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Danh mục sản phẩm
                    </h6>
                  </div>
                  <div className="card-body">
                    <Pie data={dataPieChart} />
                  </div>
                </div>
              </div>

              {/* Illustrations */}
              <div className="col-lg-6 mb-4 flex flex-wrap flex-col">

                <div className="card shadow mb-4 flex-grow">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Sản phẩm bán chạy
                    </h6>
                  </div>
                  <div className="card-body">
                    <Bar
                      data={{
                        labels: listSoldProduct?.map(i => i.product.name),
                        datasets: [
                          {
                            label: 'Sản phẩm bán chạy',
                            backgroundColor: 'rgb(0,191,255, 0.3)',
                            borderColor: 'rgb(0,191,255)',
                            borderWidth: 1,
                            data: listSoldProduct?.map(i => i.quantitySold)
                          }
                        ]
                      }}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: 'Bar Chart'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                  <Link to={'/admin/customer'}>
                    <h2 className="text-2xl font-bold mb-4">Xếp hạng người dùng có lượng chi tiêu cao nhất</h2>
                    <ul>
                      {topPrice?.map((user, index) => {
                        // console.log(user);

                        return (
                          <li key={index} className="flex justify-between items-center py-3 border-b border-gray-200 transition-colors duration-300 hover:bg-gray-50">
                            <div className="flex items-center">
                              <span className="mr-3 text-gray-500">{index + 1}.</span>
                              <span className="ml-3 font-medium">{user[1]?.name}</span>
                              <span className="px-1">-</span>
                              <span className="mr-3">   {user[1].phoneNumber}</span>
                            </div>
                            <div className="font-semibold text-gray-700">{user[1]?.totalPrice.toLocaleString()} đ</div>
                          </li>
                        );
                      })}
                    </ul>
                  </Link>
                </div>
              </div>

            </div>



            <div className="col-xl-8 col-lg-7">
              <div className="card shadow mb-4">
                {/* Card Header - Dropdown */}
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    Thống kê lợi nhuận theo tháng - {moment().format("YYYY")}
                  </h6>
                </div>
                {/* Card Body */}
                <div className="card-body">

                  <Line data={dataProfitByMonth} options={{
                    animation: {
                      duration: 1000, // Thời gian animation (milliseconds)
                      easing: 'linear' // Loại easing cho animation
                    },
                    hover: {
                      mode: 'nearest', // Chế độ hiển thị tooltip khi di chuột qua
                      intersect: true // Tooltip hiển thị khi di chuột qua các điểm dữ liệu
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Tháng'
                        },
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: 'black'
                        }
                      },
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Đơn vị (VND)'
                        },
                        grid: {
                          color: 'gray'
                        },
                        ticks: {
                          color: 'black'
                        }
                      }
                    },
                    elements: {
                      line: {
                        cubicInterpolationMode: 'monotone' // Chọn cách nối dữ liệu để làm cho đường line mềm mại hơn
                      }
                    }
                  }}>
                  </Line>


                </div>
              </div>
            </div>



          </div>
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}
      </div>
      {/* End of Content Wrapper */}
    </>
  );
};

export default Dashboard;
