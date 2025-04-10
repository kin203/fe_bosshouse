import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
const Banner = () => {
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);


    return (
        <div className="relative mb-1">
            <Swiper

                spaceBetween={10} // Thay đổi khoảng cách giữa các slide
                slidesPerView={1} // Số lượng slide hiển thị trên màn hình
                centeredSlides={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                <SwiperSlide>
                    <div className="relative w-full">
                        <img className=" w-full object-fill" src="/images/banner_01.jpg" alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="relative w-full ">
                        <img className="w-full object-fill" src="/images/banner_02.jpg" alt="" />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="relative w-full ">
                        <img className="w-full  object-fill" src="/images/banner_03.jpg" alt="" />
                    </div>
                </SwiperSlide>
            </Swiper>
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 m-12 my-12 gap-5 overflow-hidden">
                <div
                    data-aos="none md:fade-right"
                    className=" flex gap-3 px-[10px] rounded-[20px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid">
                    <div className=" flex items-center ">
                        <i className="fa-solid fa-house text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2 text-[blue] "></i>
                    </div>
                    <div className="mx-auto  w-full mt-2">
                        <p className="text-[16px] font-bold my-[5px]">Hoạt Động</p>
                        <p className="xl:text-[13px] text-[12px] font-normal mb-2">Với tiêu chí "Pets are family", BossHouse sẽ làm hết khả năng của mình với thú cưng của bạn  </p>
                    </div>
                </div>
                <div
                    data-aos="none md:fade-right" data-aos-offset='200'
                    className=" flex gap-3 px-[10px] rounded-[20px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                    <div className=" flex items-center ">

                        <i className="fa-solid fa-heart text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2 text-[blue]"></i>
                    </div>
                    <div className="mx-auto  w-full mt-2">
                        <p className="text-[16px] font-bold my-[5px]">Dịch Vụ</p>
                        <p className="xl:text-[13px] text-[12px] font-normal mb-2">Chúng tôi tự hào khi được chăm sóc và phục vụ những thú cưng của khách hàng</p>
                    </div>
                </div>
                <div
                    data-aos="none md:fade-left" data-aos-offset='200'
                    className=" flex gap-3 px-[10px] rounded-[20px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid">
                    <div className=" flex items-center ">

                        <i className="fa-solid fa-users text-3xl  xl:w-[40px]  xl:mt-8 xl:ml-2 w-[40px] h-[70px] mt-4 ml-2  text-[blue]"></i>
                    </div>
                    <div className="mx-auto w-full mt-2">
                        <p className="text-[16px] font-bold my-[5px]">Nhân viên</p>
                        <p className="xl:text-[13px] text-[12px] font-normal mb-2">Tiếp đãi chu đáo , nhiệt tình , tận tâm với công việc và yêu thích thú cưng  </p>
                    </div>
                </div>
                <div
                    data-aos="none md:fade-left" data-aos-delay='200'
                    className=" flex gap-3 px-[10px] rounded-[20px] overflow-hidden border-dashed border-2 border-blue-500 hover:border-solid ">
                    <div className=" flex items-center ">
                        <i className="fa-solid fa-thumbs-up text-3xl xl:ml-2 xl:w-[40px]  xl:mt-8 w-[40px] h-[70px] mt-4 ml-2 text-[blue]"></i>
                    </div>
                    <div className="mx-auto w-full mt-2">
                        <p className="text-[16px] font-bold my-[5px]">Sản Phẩm </p>
                        <p className="xl:text-[13px] text-[12px] font-normal mb-2">Đảm bảo chất lượng và uy tín , mang lại cho khách hàng sự trải nghiệm tốt nhất </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;
