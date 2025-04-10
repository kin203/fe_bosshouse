import Aos from 'aos';
import 'aos/dist/aos.css'; import { useEffect } from 'react';
const Gallery = () => {
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);


    return (
        <section className="section-gallery bg-[url('/images/bg-img.jpg')] bg-[#5539390e] w-full py-12">
            <div data-aos='fade-up' className="title mx-auto text-center row-auto">
                <h3 className="font-bold xl:text-3xl text-2xl text-white">"KHÁCH HÀNG" CỦA BOSSHOUSE</h3>
                <img className="mx-auto text-center mt-3 mb-10" src="/images/ngoi-sao.png" alt="" />
            </div>
            <div className="row mt-[20px] mb-[20px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5 place-items-center xl:mx-[40px] lg:mx-[40px] md:mx-[80px] mx-[40px]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                    <div data-aos='fade-up' key={index} className="col-item sm:h-[180px]  md:h-[200px] lg:h-[300px] xl:h-[300px] w-full items-center justify-center rounded-2xl overflow-hidden">
                        <img
                            className="cursor-grab object-cover w-full h-full hover:scale-[1.1] transition-transform ease-in-out duration-500"
                            src={`/images/img_v${index}.png`}
                            alt={`Image ${index}`}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;

