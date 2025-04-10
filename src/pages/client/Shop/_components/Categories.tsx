import { useState, useEffect } from "react"
import { getAllCategory } from "../../../../services/categories";
import { Link } from "react-router-dom";

const Categories = () => {
    const [category, setCategory] = useState([])
    const [isLoading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);

    useEffect(() => {
        setLoading(true)
        try {
            const fetchCategory = async () => {
                const res = await getAllCategory({ page: current })
                setCategory(res.data.docs)
                setLoading(false)
            }
            fetchCategory()
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }, [current]);

    return (
        <>
            <section className="my-[30px] ">
                <div className=" lg:grid lg:grid-cols-2 md:flex flex-wrap gap-5 justify-center items-center">
                    <div className="video flex flex-wrap gap-5 justify-center items-center ">
                        <img className=" w-[80%]" src="https://chomeocanh.com/wp-content/uploads/2023/05/do-cho-cho.jpg" alt="" />
                        <img className=" w-[80%] " src="../images/chokhongangi.jpg" alt="" />
                    </div>
                    <div className="categories p-2">
                        <div className="py-2">
                            <h3 className=" text-[#0000ff] text-2xl font-medium">Đồ cho chó giá rẻ? Shop bán đồ dùng cho chó gần đây?</h3>
                            <p className="py-1">
                                <span className="text-[100%] text-[#ff00ff] font-bold">Nhấp để chọn danh mục sản phẩm bạn muốn mua</span>
                            </p>
                        </div>

                        <ul className="noidung-dactinh grid  md:grid-cols-2 gap-x-5 sm:grid-cols-1 text-sm px-2 py-1 leading-6 text-blue-500">
                            {
                                category?.map((item: any, index: number) => {
                                    return (
                                        <li key={index}  className="py-[3px]">
                                            <Link to={`/catshop/${item._id}`}>{item.name}</Link>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className=" flex flex-wrap gap-4 py-4">
                            <button className=" p-3 object-cover bg-[#3f41db] rounded-xl text-center "><Link to="" target="_self" className="button primary text-white font-medium text-xl  " >
                                <i className="icon-user" aria-hidden="true"></i>
                                <span>Chat Zalo với BossHouse</span>
                            </Link></button>
                            <button className="p-3 object-cover bg-[#333356] rounded-xl text-center"><Link to="tel:0366292585" target="_self" className="button secondary text-white font-medium text-xl  ">
                                <i className="icon-phone" aria-hidden="true"></i>  <span>Hotline: 0366292585</span>
                            </Link></button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Categories