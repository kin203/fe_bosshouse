import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBlog, useBlogID } from "../../../hooks/apis/blog";
import { convertToHtml } from "../../../utils/convertToHtml";
import moment from "moment";

export const BlogDeatl = () => {
  const { id } = useParams()
  const blog = useBlogID(id)

  console.log(blog);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto">
      <main className="mt-16">
        <div className="mb-4 md:mb-0 w-full max-w-screen-lg mx-auto relative xl:h-[448px] h-[250px]" >
          <div className="absolute left-0 bottom-0 w-full h-full z-10 bg-gradient-to-b from-transparent to-black via-transparent"></div>
          <img src={blog?.data?.imageTitle} className="absolute left-0 top-0 xl:w-full xl:h-full z-0 object-cover" />
          <div className="p-4 absolute bottom-0 left-0 z-20">
            <div className="flex mt-3">
              <img src={blog?.data?.imageTitle}
                className="xl:h-16 xl:w-16 h-14 w-14 rounded-full mr-2 object-cover" />
              <div>
                <p className="font-semibold text-gray-200 xl:text-xl text-lg">{blog?.data?.author} </p>
                <p className="font-semibold text-gray-400 xl:text-base text-sm">{moment(blog?.data?.createdAt).format("DD - MM - YYYY")} </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-0  text-gray-700 max-w-screen-lg mx-auto text-lg leading-relaxed">
          <h2 className="xl:text-4xl text-3xl font-semibold">
            {blog?.data?.title}
          </h2>
          <p className="py-6 xl:text-xl text-lg">  {convertToHtml(blog?.data?.content)}</p>
        </div>
      </main>
    </div>
  )
}