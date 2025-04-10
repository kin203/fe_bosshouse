import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import { Modal, Pagination, Space, Table } from 'antd';
import { useSelector } from 'react-redux';
import { deleteBlog, deleteManyBlog, getAllBlog } from '../../../services/blog';
import { convertToHtml } from '../../../utils/convertToHtml';
import { ColumnsType } from 'antd/es/table';
import { BlogType } from '../../../common/type';
import moment, { MomentInput } from 'moment';
import { useColumnSearch } from '../../../hooks/useColumnSearch';
import { useDebounce } from '../../../utils/debouce';
import { Skeleton, Typography } from '@mui/material';
import { useUser } from '../../../hooks/apis/users';
import { useRole } from '../../../hooks/apis/roles';
import { useBlogNoPaginate } from '../../../hooks/apis/blog';

const ListBlog = () => {
  const [current, setCurrent] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [blog, setBlog] = useState([]);
  const [blogInit, setBlogInit] = useState([]);
  const [listBlogChecked, setListBlogChecked] = useState([])
  document.title = 'Quản lý bài viết'

  const [open, setOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    _id: "",
    content: "",

  });

  const handleOpen = (item: any) => {
    setModalInfo(item);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const { data: listBlogNoPaginate } = useBlogNoPaginate()
  useEffect(() => {
    setBlog(listBlogNoPaginate?.data)
    setBlogInit(listBlogNoPaginate?.data)
  }, [listBlogNoPaginate]);

  const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)
    const keyWordDebounce = useDebounce(keyWordSearch, 700)

    useEffect(() => {
        if (keyWordDebounce && keyWordDebounce !== '') {
            const blogFilter = blogInit?.filter(p =>
                p.title.toLowerCase().trim().includes(keyWordDebounce.toLowerCase()) ||
                p.content.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.author.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) 
            );
            // console.log(userFilter)
            setBlog(blogFilter);
        } else {
            setBlog(blogInit);
        }
    }, [keyWordDebounce]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Xác nhận xóa!",
      text: "Bạn có muốn xóa bài viết này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa!",
      cancelButtonText: 'Không'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteBlog(id)
          const newCategory = blog.filter(c => c._id != id)
          setBlog(newCategory)

          Swal.fire({
            title: res.data.message,
            icon: "success"
          })
        } catch (error) {
          Swal.fire({
            title: "Xóa thất bại!",
            text: error?.response?.data?.message,
            icon: "error"
          })
        }
      }
    });
  }

  const handleDeleteMany = async () => {
    if (!confirm("Xác nhận xóa nhiều danh mục ?")) return
    try {
      const res = await deleteManyBlog(listBlogChecked)
      // Set lại state list sản phẩm khác với list sản phẩm đã bị xóa.
      const categoryInAOnly = blog.filter(itemA => {
        return !listBlogChecked.some(itemB => itemB._id == itemA._id);
      });
      setBlog(categoryInAOnly)

      Swal.fire({
        title: "Xóa nhiều danh mục thành công!",
        icon: "success"
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Phân quyền
  const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined
  const { data: u } = useUser(userSession?._id)
  const { data: dataRole } = useRole(u?.data?.roleId)
  const [permissions, setPermission] = useState([]);

  useEffect(() => {
    if (dataRole) {
      setPermission(dataRole?.data?.permissions);
    }
  }, [dataRole, u]);


  //searching
  const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<BlogType>();
  const columns: ColumnsType<BlogType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: '4%',
      align: 'center',
      render: (value, record, index) => index + 1,
    },

    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      // width: '15%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageTitle',
      render(value, record, index) {
        return <img src={record?.imageTitle} alt="image" />
      },
      width: '12%',
      align: 'center'

    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      ...getColumnSearchProps('author')
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value, record, index) => moment(record?.createdAt as MomentInput).format("HH:mm - DD/MM/YYYY"),
      //chuyển sang dạng số timestamp để sắp xếp
      // sorter: (a, b) => moment(a.createdAt as MomentInput).unix() - moment(b.createdAt as MomentInput).unix(),
      // defaultSortOrder: 'descend',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      render(value, record, index) {
        return <i onClick={(event) => {
          handleOpen(record)
          event.stopPropagation()
        }} className="fa-solid fa-eye p-2"></i>
      },
      width: '8%',
      align: 'center'
    },
    {
      title: 'Hành động',
      key: '',
      align: "center",
      render: (value, record, index) => (
        <Space size="small">
          {
            permissions.includes('updateBlog') ?
              <Link to={`/admin/blog/update/${record._id}`}>
                <button aria-label='edit' type="button" className="btn btn-success bg-green-600">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </Link> : null
          }
          {
            permissions.includes('deleteBlog') ?
              <button aria-label='delete'
                type="button" onClick={() => handleDelete(String(record?._id))}
                className="btn btn-danger bg-red-600"
              >
                <i className="fa-regular fa-trash-can"></i>
              </button> : null
          }
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table className='h-[100vh]'
        title={() => (
          <div className='flex justify-between py-3 mx-3'>
            <h3 className='font-bold text-3xl'>Bài viết</h3>
            <div className='flex '>
              <div>
                {
                  listBlogChecked?.length > 0 ? (
                    <button onClick={handleDeleteMany} className='btn btn-primary'>Xóa các bài viết đã chọn</button>) : undefined
                }
              </div>

              <Link to={'/admin/blog/add'}>
                <button className='btn btn-primary ml-2'>Thêm bài viết</button>
              </Link>
            </div>
          </div>
        )}
        loading={isLoading}
        size='middle'
        rowKey='_id'
        rowSelection={{
          onSelect: (record, selected, selectedRows) => {
            // console.log(record, selected, selectedRows);
            setListBlogChecked(selectedRows);
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            // console.log(selected, selectedRows, changeRows);
            setListBlogChecked(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            // console.log(selectedRowKeys, selectedRows);
            setListBlogChecked(selectedRows);
          }

        }}
        pagination={{ position: ['bottomCenter'] }}
        columns={columns?.map((item) => ({ ...item }))}
        dataSource={blog}
        // scroll={{ y: '65vh', x: true }}
      />

      <Modal title="Nội dung"
        width={800}
        open={open}
        onCancel={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {convertToHtml(modalInfo?.content)}
      </Modal>
    </>
  );
};

export default ListBlog;