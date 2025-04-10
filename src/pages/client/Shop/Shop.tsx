import Categories from "./_components/Categories";
import ProductList from "./_components/ProductList";
import Address from "./_components/Address";
import { useEffect, useState } from "react";
import { useProducts } from "../../../hooks/apis/products";
import { setReload } from "../../../redux/slices/Reload";
import { useDispatch, useSelector } from "react-redux";

const Shop = () => {
    // const [products, setProducts] = useState([]);

    useEffect(() => {
        document.title = "Sản phẩm";
        window.scrollTo(0, 0);
    }, [])
    // const {data} = useProducts({page: 1, limit: 8})
    // console.log(data)

    // useEffect(() => {
    //     setProducts(data?.data?.docs)
    // }, [data]);

    const reload = useSelector((state: { reload: any }) => state.reload);
    const dispatch = useDispatch()
    useEffect(() => {
        // When the component mounts, check if "reload" is true
        // If it is, set it to false and reload the page
        if (reload) {
            dispatch(setReload(false));
            window.location.reload();
        }
    }, [reload]);
    return (
        <div className="m-auto flex flex-wrap justify-center md:px-11 ">
            {/* <ProductList data={products} setdata={setProducts} /> */}
            <ProductList />
            {/* <Categories /> */}
            <Address />
            {/* <Introduce /> */}
        </div>
    );
};

export default Shop;
