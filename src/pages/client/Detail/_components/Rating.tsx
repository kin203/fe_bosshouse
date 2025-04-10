import React, { useEffect, useState } from 'react';
import { Collapse, Flex, Rate } from 'antd';
import { useProduct } from '../../../../hooks/apis/products';
import { useParams } from 'react-router-dom';
import { getReviewsByProductId } from '../../../../services/review';
import { timeAgo } from '../../../../utils/dateTime';
import { getOneUsers } from '../../../../services/users';

const { Panel } = Collapse;

const Rating = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null)

  const data = useProduct(id);

  useEffect(() => {
    (async () => {
      try {
        const res = await getReviewsByProductId({ productId: data.data._id })
        setReview(res?.data)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [data])

  return (
    <section className="accordion-item">
      <Collapse accordion defaultActiveKey={['1']}>
        <Panel header="Mô tả" key="1" className='font-bold '>
          <div className="reviews-content p-1 font-medium ml-4">
            <h6>{data?.data?.description}</h6>
          </div>
        </Panel>

        <Panel header={`Đánh giá (${review?.length || 0})`} key="2" className='font-bold '>
          <div className="reviews px-4">
            <div className="form-review">

              <ul className="divide-y divide-gray-200">
                {
                  review?.map((item, i) => {
                    return (
                      <li className="py-4" key={i}>
                        <span className="flex space-x-3">
                          <img className="h-10 w-10 rounded-full" src={item?.userData?.avatar} alt="Avatar" />
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-gray-900">{item?.userData?.username}</h3>
                              <span className="mx-2 text-sm font-normal">•</span>
                              <span className="text-sm font-normal">{timeAgo(item?.createdAt)}</span>
                            </div>
                            <Flex gap="middle" vertical className='my-2'>
                              <p className="text-sm font-medium">Đánh giá:  <Rate value={item?.rating} className='text-base ml-2' /></p>
                            </Flex>
                            <div>
                              {
                                item?.images?.map((item, i) => {
                                  return (
                                    <span key={i} className='inline-block w-[50px] h-[50px] shadow-sm mr-2'>
                                      <img
                                        className="w-full h-full"
                                        src={item}
                                      />
                                    </span>
                                  )
                                })
                              }
                            </div>
                            <p className="mt-1 text-sm font-medium">Nội dung: {item?.comment}</p>
                          </div>
                        </span>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>
        </Panel>
      </Collapse>
    </section>
  );
};

export default Rating;
