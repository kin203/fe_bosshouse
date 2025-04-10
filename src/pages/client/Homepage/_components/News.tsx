import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import Loading from "../../../../components/loading/Loading";
import { useBlog } from "../../../../hooks/apis/blog";
import { convertToHtml } from "../../../../utils/convertToHtml";
import Aos from 'aos';
import 'aos/dist/aos.css';
import { Skeleton } from "@mui/material";
const News = () => {
    const [current, setCurrent] = useState(1);
    const { data, isLoading } = useBlog(current);
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);


    // load về đầu trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <div>
            <div className="bg-[#f7f8f8] h-auto  cursor-pointer xl:px-[60px] px-[20px] py-[64px]">
                <div data-aos='fade-up' className="text-center">
                    <h2 className="font-bold xl:text-3xl text-2xl mb-4 ">BÀI VIẾT</h2>
                    <div>
                        <img className="block mx-auto" src="/images/ngoi-sao.png" alt="img" />
                    </div>
                </div>
                {isLoading ? (
                    <div data-aos='fade-up' className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-[15px]">
                        {[...Array(3)].map((item, index) => (
                            <div key={index} className="text-center mt-[35px]">
                                <Skeleton animation="wave" variant="rectangular" height={230} sx={{ marginBottom: '1rem' }} />

                                <div className="px-[10px]">
                                    <Skeleton sx={{ fontSize: '1.5rem' }} />
                                    <Skeleton animation="wave" />
                                    <Skeleton animation="wave" />
                                    <Skeleton animation="wave" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div data-aos='fade-up' className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-[15px]">
                        {data?.data?.docs?.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-center mt-[35px]">
                                <Link to={`/blogDetail/${item?._id}`}>
                                    <div className="overflow-hidden">
                                        <img src={item?.imageTitle} alt="" className="xl:w-full xl:h-[230px] lg:w-[280px] lg:h-[280px] md:w-full md:h-[490px] w-full h-[260px] transform transition-transform duration-300 hover:scale-105 mx-auto object-cover cursor-pointer" />
                                    </div>
                                </Link>
                                <div className="px-[10px]">
                                    <Link to={`/blogDetail/${item?._id}`}><h3 className="font-bold xl:text-[18px] text-[17px] mt-5">{item.title?.length > 30 ? item.title.slice(0, 30) + ' [...]' : item.title}</h3></Link>
                                    <p className="mt-[10px] leading-5 text-[15px] font-normal">{convertToHtml(item.content?.length > 50 ? item.content.slice(0, 150) : item.content)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ione */}
                {/* <div className="grid xl:grid-cols-4 lg:grid-cols-4 grid-cols-1 md:grid-cols-4  mt-12 pb-[20px] gap-5">
                    <div className="xl:flex lg:flex gap-3 flex px-[10px]  bg-white md:flex rounded-[5px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                        <div className=" ">
                            <i className="fa-solid fa-house text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2 text-[blue] "></i>
                        </div>
                        <div className="mx-auto  w-full mt-2">
                            <p className="text-[16px] font-bold my-[5px]">Hoạt Động</p>
                            <p className="xl:text-[13px] text-[12px] font-normal mb-2">Với tiêu chí "Dog is family", BossHouse sẽ làm hết khả năng của mình với thú cưng của bạn  </p>
                        </div>
                    </div>
                    <div className="xl:flex lg:flex gap-3 flex px-[10px]  bg-white md:flex rounded-[5px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                        <div className=" ">
                            <i className="fa-solid fa-heart text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2 text-[blue]"></i>
                        </div>
                        <div className="mx-auto  w-full mt-2">
                            <p className="text-[16px] font-bold my-[5px]">Dịch Vụ</p>
                            <p className="xl:text-[13px] text-[12px] font-normal mb-2">Chúng tôi tự hào khi được chăm sóc và phục vụ những thú cưng của khách hàng</p>
                        </div>
                    </div>
                    <div className="xl:flex lg:flex gap-3 flex px-[10px]  bg-white md:flex rounded-[5px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                        <div className=" ">
                            <i className="fa-solid fa-users text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2  text-[blue]"></i>
                        </div>
                        <div className="mx-auto w-full mt-2">
                            <p className="text-[16px] font-bold my-[5px]">Nhân viên</p>
                            <p className="xl:text-[13px] text-[12px] font-normal mb-2">Tiếp đãi chu đáo , nhiệt tình , tận tâm với công việc và yêu thích thú cưng  </p>
                        </div>
                    </div>
                    <div className="xl:flex lg:flex gap-3 flex px-[10px]  bg-white md:flex rounded-[5px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                        <div className=" ">
                            <i className="fa-solid fa-thumbs-up text-3xl xl:ml-2 xl:w-[40px]  xl:mt-8 w-[40px] h-[70px] mt-4 ml-2 text-[blue]"></i>
                        </div>
                        <div className="mx-auto w-full mt-2">
                            <p className="text-[16px] font-bold my-[5px]">Sản Phẩm </p>
                            <p className="xl:text-[13px] text-[12px] font-normal mb-2">Đảm bảo chất lượng và uy tín , mang lại cho khách hàng sự trải nghiệm tốt nhất </p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div >
    )
}

export default News