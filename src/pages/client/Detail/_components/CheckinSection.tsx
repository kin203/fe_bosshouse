import { useState } from 'react';
import { Virtual, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CustomerCheckin = () => {

    const [slides, setSlides] = useState(
        Array.from({ length: 10 }).map((_, index) => `Slide ${index + 1}`)
    );

    return (
        <section className='py-12 bg-blue-50  '>
            <div className="flex justify-center section-title-container text-center p-4 uppercase">
                <h2 className="section-title section-title-center flex">
                    <p className="section-title-main w-full text-[#d69704] text-2xl font-medium">Khách hàng checkin</p>

                </h2>
            </div>
            <div className="swiper w-[90%]">
                <Swiper
                    modules={[Virtual, Navigation, Pagination]}
                    onSwiper={() => setSlides}
                    slidesPerView={4}
                    centeredSlides={false}
                    spaceBetween={30}
                    pagination={{
                        type: 'custom',
                    }}
                    navigation={true}
                    virtual={false}
                    breakpoints={{
                        375: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 15,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 25,
                        },
                    }}
                >
                    {slides.map((slideContent, index) => (
                        <SwiperSlide className='' key={slideContent} virtualIndex={index}>
                            <div className='text-center'>
                                <img className='rounded-md' src="https://sohanews.sohacdn.com/160588918557773824/2022/6/8/photo-3-165467153284861968929.jpg" alt="" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section >
    )
}

export default CustomerCheckin