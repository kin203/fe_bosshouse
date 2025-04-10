import { useEffect } from "react";
import CheckinSection from "./_components/CheckinSection";
import DetailSection from "./_components/DetailSection";
import Rating from "./_components/Rating";
import RelatedSection from "./_components/RelatedSection";
import { useProduct, useProducts } from "../../../hooks/apis/products";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setReload } from "../../../redux/slices/Reload";

const DetailPage = () => {
  const { id } = useParams()

  useEffect(() => {
    document.title = "Chi tiết sản phẩm"
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading } = useProducts({ page: 1 })
  const product = useProduct(id)

  const cungDanhMuc = data?.data?.docs?.filter((item, i) => item.categoryId == product?.data?.categoryId?._id)

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
  return <div className="m-0 ">
    <DetailSection data={product || []} isLoading={isLoading} />
    <Rating />
    <RelatedSection data={cungDanhMuc} isLoading={isLoading} />
    <CheckinSection />
  </div>;
};

export default DetailPage;