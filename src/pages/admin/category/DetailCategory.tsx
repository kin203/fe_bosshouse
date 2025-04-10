import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCategory, useCategoryID } from '../../../hooks/apis/category';
import { getAllCategoryNoPaginateDetail } from '../../../services/categories';
import { Link } from 'react-router-dom';
import Loading from '../../../components/loading/Loading';
import Swal from 'sweetalert2'
import { Button, Dropdown, Image, MenuProps, Modal, Pagination, Space } from 'antd';
import { deleteCategory, deleteManyCategory, getAllCategory } from '../../../services/categories';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../utils/debouce';
import { DownOutlined } from '@ant-design/icons';
import { Skeleton, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/products';
import { ColumnsType } from 'antd/es/table';
import { CategoryType } from '../../../common/type';



const DetailCategory = () => {
  const { id } = useParams();
  const [detailCategory, setDetailCategory] = useState<any>();
  // const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllCategoryNoPaginateDetail();
      console.log(response.data);

      const item = response?.data?.find(i => i._id == id)
      console.log(item);

      setDetailCategory(item);
    };
    fetchData();
  }, [id]);

  console.log(',detailCategory', detailCategory)
  //columns

  return (
    <>
      {/* <div>
        <p>Tên danh mục: {detailCategory?.name}</p>
        <p>Mô tả: {detailCategory?.slug}</p>
        <p>Số lượng: {detailCategory?.products?.length} sản phẩm</p>
        {detailCategory?.products?.length > 0 ? (
          <ul className='mt-2'>
            {detailCategory?.products?.map((item: any) => (
              <li key={item._id} className='flex gap-x-[10px] items-center mb-1'>
                <img width={40} height={40} src={item?.images[0].response.urls[0]} alt="img" />
                <div>
                  <span className='block text-[12px]'>{item?.name}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : undefined}
      </div> */}
      <div className='mx-4 h-auto bg-white'>
        <div className='flex justify-between py-3'>
          <h3 className='font-bold text-3xl'>Danh mục :  {detailCategory?.name}</h3>

        </div>
        <div className='h-[180vh]'>
          <table className="table table-hover text-center">
            <thead className="bg-[#fafafa]">
              <tr>
                <th scope="col">STT</th>
                <th scope="col">Hình ảnh</th>
                <th scope="col">Tên sản phẩm</th>
                <th scope="col">Giá bán</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Số lượng</th>
              </tr>
            </thead>

            <tbody>

              {
                detailCategory?.products
                  ?.map((item: any, index: number) => {
                    console.log('item', item);

                    return (
                      <tr key={index} className='cursor-pointer'>
                        <td>{index + 1}</td>
                        <td>
                          <Image
                            style={{ objectFit: 'contain' }}
                            width={70}
                            height={70}
                            src={item?.images[0]?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                            placeholder={
                              <Image
                                preview={false}
                                src="https://i.pinimg.com/originals/2e/60/07/2e60079f1e36b5c7681f0996a79e8af4.jpg"
                                width={100}
                              />
                            }
                          />
                        </td>
                        <td className='pt-4'>{item.name?.length > 25 ? item.name.slice(0, 25) + '...' : item.name}</td>
                        <td className='p-4'>{formatCurrency(item?.sizes[0]?.price)}</td>
                        <td className='p-4'>{item.description.length > 25 ? item.description.slice(0, 25) + '...' : item.description}</td>
                        <td className='p-4'>{item?.sizes[0]?.quantity}</td>
                      </tr>
                    )
                  })
              }
            </tbody>

          </table>
        </div>


      </div>
    </>
  );
};

export default DetailCategory;
