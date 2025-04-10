import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import Loading from "../../../components/loading/Loading";
import { useBlog, useBlogNoPaginate } from "../../../hooks/apis/blog";
import { convertToHtml } from "../../../utils/convertToHtml";
import moment from 'moment';
import { Avatar, Card, CardContent, CardHeader, IconButton, Skeleton } from "@mui/material";
import { MoreOutlined } from "@ant-design/icons";

const Blog = () => {
    const [current, setCurrent] = useState(1);
    const { data, isLoading } = useBlog(current);
    const { data: listBlogNoPaginate } = useBlogNoPaginate()
    // console.log(listBlogNoPaginate)
    document.title = "Blog tin tức";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className="text-gray-600 body-font xl:mt-14 mt-16">
            <h1 className=" text-center text-gray-800 text-3xl font-bold lg:mt-0 mt-10">Bài viết</h1>

            <div className="container px-4 py-4 mx-auto">

                {isLoading ? (
                    <div className="flex flex-wrap -m-4">
                        {[...Array(3)].map(
                            (index) => (
                                <div key={index} className="p-3 w-full md:w-1/2 lg:w-1/3" >
                                    <Card>
                                        <CardHeader
                                            avatar={
                                                <Skeleton
                                                    animation="wave"
                                                    variant="circular"
                                                    width={40}
                                                    height={40}
                                                />
                                            }
                                            action={null}
                                            title={
                                                <Skeleton
                                                    animation="wave"
                                                    height={16}
                                                    width="80%"
                                                    style={{ marginBottom: 6 }}
                                                />

                                            }
                                            subheader={
                                                <Skeleton animation="wave" height={10} width="40%" />
                                            }
                                        />
                                        <Skeleton sx={{ height: 190 }} animation="wave" variant="rectangular" />
                                        <CardContent>
                                            <Skeleton animation="wave" height={14} style={{ marginBottom: 6 }} />
                                            <Skeleton animation="wave" height={40} width="100%" />
                                            <Skeleton animation="wave" height={14} width="30%" />
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap -m-4">
                        {listBlogNoPaginate?.data?.map((item, index) => (
                            <div key={index} className="p-3 w-full md:w-1/2 lg:w-1/3" >
                                <Card >
                                    <CardHeader
                                        avatar={
                                            <Avatar
                                                src={item?.imageTitle}
                                                alt="author"
                                            />
                                        }
                                        action={
                                            <IconButton aria-label="settings">
                                                <MoreOutlined />
                                            </IconButton>
                                        }
                                        title={
                                            <p className="font-bold text-lg ">{item?.author}</p>
                                        }
                                        subheader={
                                            <p className="text-xs">{moment(item?.createdAt).format("DD - MM - YYYY")}</p>
                                        }
                                    />
                                    <Link to={`/blogDetail/${item?._id}`} className="overflow-hidden">
                                        <img className="lg:h-48 md:h-36 w-full object-cover object-center transform transition-transform duration-300 hover:scale-105 mx-auto cursor-pointer" src={item?.imageTitle} alt="blog cover" />
                                    </Link>
                                    <CardContent>
                                        <div className="">
                                            <Link to={`/blogDetail/${item?._id}`}>
                                                <h1 className="tracking-widest line-clamp-1 text-sm title-font font-bold text-blue-600 mb-1 uppercase ">{item.title}</h1>
                                            </Link>
                                            <h1 className="title-font line-clamp-2 text-lg font-medium text-gray-900 mb-3">
                                                {convertToHtml(item.content)}
                                            </h1>

                                            <div className="flex items-center flex-wrap ">
                                                <Link to={`/blogDetail/${item?._id}`} className="text-green-800  md:mb-2 lg:mb-0">
                                                    <p className="inline-flex items-center">Xem thêm
                                                        <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12h14"></path>
                                                            <path d="M12 5l7 7-7 7"></path>
                                                        </svg>
                                                    </p>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Blog;