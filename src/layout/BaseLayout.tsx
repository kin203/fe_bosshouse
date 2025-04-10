import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import BackBtn from "../components/BackBtn";

const BaseLayout = () => {
    const location = useLocation();

    return (
        <>
            <Header />
            <div className="xl:pt-[120px] pt-[75px] md:pt-[100px]">
                {location.pathname !== '/' && <BackBtn />}
                <Outlet />
            </div>
            <Footer />
        </>
    );
};

export default BaseLayout;