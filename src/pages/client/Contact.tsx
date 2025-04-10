import { Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addContact } from "../../services/contact";
import Swal from "sweetalert2";
import TextArea from "antd/es/input/TextArea";

const ContactPage = () => {
    useEffect(() => {
        document.title = 'Liên hệ'
        window.scrollTo(0, 0);
    }, []);

    const [form] = Form.useForm();
    const next = useNavigate()
    const [disable, setDisable] = useState(false)

    const onFinish = async (values: IProduct) => {
        setDisable(true)
        try {
            const res = await addContact(values)
            Swal.fire({
                title: "Gửi yêu cầu thành công !",
                text: res?.data?.message,
                icon: 'success'
            })
            setDisable(false)
            next('/')
        } catch (error) {
            Swal.fire({
                title: "Gửi thất bại!",
                text: error?.response?.data?.message,
                icon: "error"
            })
            setDisable(false)
        }

    };
    return <div>
        <section className="bg-white mt-14  overflow-hidden relative z-10">
            <div className="container ">
            <h1 className="text-4xl font-bold text-dark text-center">BossHouse hân hạnh được hỗ trợ quý khách!</h1>
                <div className="flex flex-wrap lg:justify-between -mx-4 my-10">
                    <div className="w-full lg:w-1/2 xl:w-6/12 px-4">
                        <div className="bg-white  relative rounded-lg p-4 sm:p-12">
                            <p className=" text-base leading-6 text-gray-500 my-4">Vui lòng nhập thông tin để được hỗ trợ.</p>
                            <Form form={form} onFinish={onFinish}>
                                <div className="mb-4">
                                    <label htmlFor="large-input" className="block mb-2 text-base font-medium text-gray-900 ">
                                        Họ và tên
                                    </label>
                                    <Form.Item name={"fullName"} rules={[
                                        { required: true, message: "Vui lòng nhập họ và tên !" },
                                    ]}>
                                        <Input className=" w-full rounded px-[14px] text-body-color text-base border border-[f0f0f0] outline-none focus-visible:shadow-none focus:border-primary" />
                                    </Form.Item>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="large-input" className="block mb-2 text-base font-medium text-gray-900 ">
                                        Email
                                    </label>
                                    <Form.Item name={"email"} rules={[
                                        { required: true, message: "Vui lòng nhập email !" },
                                    ]}>
                                        <Input className=" w-full rounded px-[14px] text-body-color text-base border border-[f0f0f0] outline-none focus-visible:shadow-none focus:border-primary" />
                                    </Form.Item>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="large-input" className="block mb-2 text-base font-medium text-gray-900 ">
                                        Số điện thoại
                                    </label>
                                    <Form.Item name={"phoneNumber"} rules={[
                                        { required: true, message: "Vui lòng nhập Số điện thoại !" },
                                    ]}>
                                        <Input className=" w-full rounded px-[14px] text-body-color text-base border border-[f0f0f0] outline-none focus-visible:shadow-none focus:border-primary" />
                                    </Form.Item>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="large-input" className="block mb-2 text-base font-medium text-gray-900 ">
                                        Nội dung
                                    </label>
                                    <Form.Item name={"content"} rules={[
                                        { required: true, message: "Vui lòng nhập Nội dung !" },
                                    ]}>
                                        <TextArea className=" w-full rounded px-[14px] text-body-color text-base border border-[f0f0f0] outline-none focus-visible:shadow-none focus:border-primary" />
                                    </Form.Item>
                                </div>

                                <button disabled={disable} className="w-full shadow-xl rounded-md group relative min-h-[50px] mt-3 overflow-hidden border border-blue-700 bg-white text-blue-700  transition-all before:absolute before:left-0 before:top-0 before:h-0 before:w-1/4 before:bg-blue-700 before:duration-500 after:absolute after:bottom-0 after:right-0 after:h-0 after:w-1/4 after:bg-blue-700 after:duration-500 hover:text-white hover:before:h-full hover:after:h-full">
                                    <span className="top-0 flex h-full w-full items-center justify-center before:absolute before:bottom-0 before:left-1/4 before:z-0 before:h-0 before:w-1/4 before:bg-blue-700 before:duration-500 after:absolute after:right-1/4 after:top-0 after:z-0 after:h-0 after:w-1/4 after:bg-blue-700 after:duration-500 hover:text-white group-hover:before:h-full group-hover:after:h-full"></span>
                                    <span className="absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center group-hover:text-white font-medium"> Send Message</span>
                                </button>
                                <div className=" text-[15px] text-[#5b6f4a] mt-4">
                                    Cảm ơn quý khách đã đóng góp ý kiến với chúng tôi. Mọi ý kiến đóng góp xin được ghi nhận và sửa đổi!
                                </div>
                            </Form>

                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 xl:w-6/12 px-4 lg:mt-4">
                        <div className="max-w-[570px] mb-12 lg:mb-0">
                            <h2 className=" text-dark mb-6 mt-4 uppercase font-bold text-xl sm:text-xl lg:text-xl xl:text-xl " >
                                CÙNG THẮC MẮC NHANH
                            </h2>
                            <details className="text-base text-body-color leading-relaxed mb-2 group [&_summary::-webkit-details-marker]:hidden" open>
                                <summary
                                    className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 p-4 text-gray-900"
                                >
                                    <h2 className=" mt-[5px] font-medium">Cam kết dịch vụ sản phẩm như thế nào?</h2>

                                    <svg
                                        className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeWidth="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>

                                <p className="  ml-[8px]  leading-relaxed text-gray-700">
                                    Sản phẩm được nhập từ những cơ sở sản xuất uy tín với trang thiết bị hiện đại, đóng gói cẩn thận , đảm bảo an toàn tuyệt đối về sản phẩm .
                                </p>
                            </details>

                            <details className=" text-base text-body-color leading-relaxed mb-2 group [&_summary::-webkit-details-marker]:hidden" open>
                                <summary
                                    className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 p-4 text-gray-900"
                                >
                                    <h2 className=" mt-[5px] font-medium">Thời gian giao hàng của bạn trong bao lâu</h2>

                                    <svg
                                        className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeWidth="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>

                                <p className="  ml-[8px]  leading-relaxed text-gray-700">
                                    Chúng tôi sẽ tư vấn về sản phẩm, quy trình, cách thức bảo quản online đến khách hàng. Sau khi xác định hợp tác chính thức sẽ khảo sát và cung cấp sản phẩm cũng như hỗ trợ thiết bị bảo quản sản phẩm chính hãng .
                                </p>
                            </details>

                            <details className=" text-base text-body-color leading-relaxed mb-8 group [&_summary::-webkit-details-marker]:hidden" open>
                                <summary
                                    className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 p-4 text-gray-900"
                                >
                                    <h2 className=" mt-[5px] font-medium">Chính sách thanh toán như thế nào?</h2>

                                    <svg
                                        className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeWidth="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>

                                <p className=" ml-[8px] leading-relaxed text-gray-700">
                                    Chúng tôi đa dạng hình thức thanh toán theo trực tiếp, chuyển khoản,..tuỳ theo nhu cầu và hình thức của Shop/Khách hàng. </p>
                            </details>

                            <div className="bando mb-4">
                                <div className="mb-2">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.883946847499!2d105.75591137500058!3d21.037329087484693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134549562f27c71%3A0x3ac6eca395ce63b1!2zMjMzIFBow7pjIERp4buFbiwgWHXDom4gUGjGsMahbmcsIFThu6sgTGnDqm0sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1701144352919!5m2!1svi!2s" className="w-full mx-[5px] md:w-full xl:w-[570px]"></iframe>
                                </div>
                                <div className="">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3722.9030370229757!2d105.69300367503283!3d21.07653458058476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455d193768dc1%3A0xfd2e9ac6b101245!2zUC4gVGjDuiBZLCDEkOG7qWMgVGjGsOG7o25nLCBIb8OgaSDEkOG7qWMsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1704541553076!5m2!1svi!2s" className="w-full mx-[5px] md:w-full xl:w-[570px]" ></iframe>
                                </div>

                            </div>
                            {/*  */}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </div>
};

export default ContactPage;
