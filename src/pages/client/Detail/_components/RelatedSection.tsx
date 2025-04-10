import { Link } from "react-router-dom";
import { formatCurrency } from "../../../../utils/products";
import { motion } from "framer-motion";
import { Skeleton, Typography } from "@mui/material";

const RelatedSection = ({ data, isLoading }) => {
    // console.log(data)
    return (
        <section className="m-4">
            <div className="relate-product grid">
                <div className="">
                    <div className="mt-2 mb-4 leading-7 flex items-center justify-between">
                        <span className="border-b lg:w-[40%] w-[20%] border-[#000]"></span>
                        <h1 className="lg:text-xl text-sm font-bold text-white uppercase bg-gray-900 lg:px-4 lg:py-4 px-2.5 py-2 rounded-3xl">
                            SẢN PHẨM TƯƠNG TỰ
                        </h1>
                        <span className="border-b lg:w-[40%] w-[20%] border-[#000]"></span>
                    </div>
                    <div className="flex justify-between md:justify-start  md:gap-5 flex-wrap ">
                        {isLoading ? (<>
                            {[...Array(5)].map((_, i) => {
                                return (
                                    <div className="lg:h-96 h-64 max-w-32 xs:max-w-40 lg:max-w-60 relative" key={i}>
                                        <div className="rounded-2xl w-full my-2 lg:h-60 h-40 overflow-hidden">
                                            <Skeleton variant="rectangular" width={1000} height={'100%'} />
                                        </div>
                                        <div className=" text-center">
                                            <div className="title-wrapper">
                                                <Typography variant='h5' ><Skeleton /></Typography>
                                                <Typography variant='h5' ><Skeleton /></Typography>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>) : (
                            <>
                                {data?.map((item, i) => {
                                    return (
                                        <Link key={i} to={`/products/detail/${item?._id}`}>
                                            <div className="lg:h-96 h-64 max-w-32 xs:max-w-40 lg:max-w-60 relative" key={i}>
                                                <div className="rounded-2xl my-2 lg:h-60 h-40 overflow-hidden">
                                                    <img
                                                        className="object-cover hover:scale-[1.1] lg:h-60 h-40 transition-transform ease-in-out duration-500"
                                                        src={
                                                            item?.images[0]?.response?.urls[0] ||
                                                            "https://static.thenounproject.com/png/504708-200.png"
                                                        }
                                                        alt="images"
                                                    />
                                                </div>
                                                <div className=" text-center">
                                                    <div className="title-wrapper">
                                                        <p className="name product-title line-clamp-1 mt-3 font-semibold">
                                                            <span>{item?.name}</span>
                                                        </p>
                                                    </div>
                                                    <div className=" text-xl  h-5">
                                                        <span className="text-[red] text-base font-medium">
                                                            {formatCurrency(item?.sizes[0]?.price)} -{" "}
                                                            {formatCurrency(
                                                                item?.sizes[item?.sizes?.length - 1]?.price
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Hết hàng */}
                                                {item?.sizes?.every(s => s.quantity === 0) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                                                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.7)" }}
                                                        className="absolute top-0 left-0 text-red-600 font-semibold px-3 py-1 text-sm bg-white rounded"
                                                        style={{ zIndex: 9999 }} // Đảm bảo chữ nổi lên trên cùng
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
                                    );
                                })}
                            </>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
};

export default RelatedSection;