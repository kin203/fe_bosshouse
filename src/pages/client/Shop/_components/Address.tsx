
const Address = () => {
    return (
        <div className="row w-[100%] relative mt-32 mb-10 z-0 hidden md:block">
            <div className="col">
                <div className="flex  border-b-[#3257a8] border-b-2 uppercase justify-center items-center" >
                    <div className="bg-[#1969d3] flex flex-col font-bold text-white px-5 pt-3 pb-1 rounded-t-xl" >
                        <span>Địa chỉ</span>
                    </div>
                </div>
                <div className="tab-panels flex-grow">
                    <div className=" p-4">
                        <p className="text-justify">
                            <span className="font-medium text-[#ff00ff] text-xl">Muốn mua đồ cho Boss? Ghé BossHouse ngay!</span>
                        </p>
                        <div className="text-justify  font-thin text-base ">
                            <ul className="  ml-2 my-1">
                                <li className="list-disc "><a href="https://goo.gl/maps/gn1onZF1NpjkrJ8c6">Số 39 Đức Diễn, Phúc Diễn, Bắt Từ Liêm, Hà Nội</a>. (Hẻm Xe Hơi lớn đỗ cửa).</li>
                            </ul>
                            <p className="">
                                <span dir="auto">Điện thoại: <a href="tel:0366292585">0366292585</a></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Address