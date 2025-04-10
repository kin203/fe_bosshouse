import { backgroundImage } from "html2canvas/dist/types/css/property-descriptors/background-image"
import { Link } from "react-router-dom";
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";
import './cta.css'

const Introduce = () => {
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);


    return (

        <section data-aos='fade-up' className=" max-md:text-white py-16">
            <div className=" absolute bg-[url('/images/bg-intro.png')] bg-fill filter  bg-cover inset-0"></div>
            <div className="absolute inset-0 bg-black opacity-30 md:opacity-0"></div>
            <div className="relative">
                <div className="text-center ">
                    <h2 className="font-bold xl:text-3xl text-2xl mb-2">GIỚI THIỆU</h2>
                    <div>
                        <img className="block mx-auto" src="/images/ngoi-sao.png" alt="" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2  max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 gap-5 lg:py-16 lg:grid-cols-12">

                    <div className=" lg:mt-0 lg:col-span-5 lg:flex xl:w-full lg:w-full md:w-full w-full " >
                    </div>
                    <div className="mr-auto place-self-center lg:col-span-7 ">

                        <p className=" max-w-2xl mb-6  lg:mb-8 md:text-lg lg:text-lg   ">
                            <b>BossHouse</b> là điểm đến lý tưởng cho những người yêu thú cưng, nơi cung cấp đa dạng thực phẩm chất lượng và phụ kiện đáng yêu cho các thành viên lớn nhỏ trong gia đình bạn. Với sứ mệnh mang lại sự hạnh phúc và sức khỏe cho thú cưng của bạn, <b >BossHouse</b> cam kết cung cấp sản phẩm chất lượng, an toàn và đa dạng, giúp thú cưng của bạn luôn khỏe mạnh và hạnh phúc. Hãy đến với <b>BossHouse</b> để tận hưởng trải nghiệm mua sắm thú vị và tiện lợi ngay hôm nay! <br />
                            <br />
                        </p>
                        <Link to={'/products'} className="cta flex items-center ">
                            <span className="hover-underline-animation">Mua sắm ngay </span>
                            <svg
                                id="arrow-horizontal"
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="10"
                                viewBox="0 0 46 16"
                            >
                                <path
                                    id="Path_10"
                                    data-name="Path 10"
                                    d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
                                    transform="translate(30)"
                                ></path>
                            </svg>
                        </Link>

                    </div>

                </div>
            </div>
        </section >

    );
};

export default Introduce;
