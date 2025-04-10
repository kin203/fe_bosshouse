import Banner from './_components/Banner';
import Introduce from './_components/Introduce';
import MenuToday from './_components/MenuToday';
import News from './_components/News';
import Gallery from './_components/Gallery';
import Chains from './_components/Chains';
import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from '../../../redux/slices/Reload';
import { setRepuchaseListProductChecked } from '../../../redux/slices/Cart';
const HomePage = () => {
    useEffect(() => {
        Aos.init();
        Aos.refresh(); // Optional: Refresh AOS after dynamic content changes
    }, []);

    // useEffect(() => {
    //     dispatch(setRepuchaseListProductChecked([]))
    // }, []);


    useEffect(() => {
        document.title = 'Trang chủ';
        window.scrollTo(0, 0);
    }, [])

    const reload = useSelector((state: { reload: any }) => state.reload);
    // useEffect(() => {
    //     // When the component mounts, check if "reload" is true
    //     // If it is, set it to false and reload the page
    //     if (reload) {
    //         dispatch(setReload(false));
    //         window.location.reload();
    //     }
    // }, [reload]);
    return (
        <div>
            <Banner />
            <Introduce />
            <MenuToday />
            <Gallery />
            <Chains />
            <News />
        </div>
    );

};
export default HomePage;
