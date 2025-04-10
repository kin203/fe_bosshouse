import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import { Table, Space } from 'antd';
import { deleteCategory, deleteManyCategory, getAllCategoryNoPaginate } from '../../../services/categories';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryType } from '../../../common/type';
import { ColumnsType } from 'antd/es/table';
import { } from 'antd';
import { useColumnSearch } from '../../../hooks/useColumnSearch';
import { useUser } from '../../../hooks/apis/users';
import { useRole } from '../../../hooks/apis/roles';
import { useCategoryNoPaginate } from '../../../hooks/apis/category';
import { createSlice } from '@reduxjs/toolkit';
import { selectCategory } from '../../../redux/slices/selectedCategorySlice';
import { useDebounce } from '../../../utils/debouce';

const ListCategory = () => {
  // const [isLoading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [categoryInit, setCategoryInit] = useState([]);
  const [listCategoryChecked, setListCategoryChecked] = useState([])
  document.title = 'Quản lý danh mục'
  //search
  const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<CategoryType>();

  const { data: listCategoryNoPaginate, isLoading } = useCategoryNoPaginate()
  useEffect(() => {
    setCategory(listCategoryNoPaginate?.data)
    setCategoryInit(listCategoryNoPaginate?.data)
  }, [listCategoryNoPaginate]);

  const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)
  const keyWordDebounce = useDebounce(keyWordSearch, 700)

  useEffect(() => {
    if (keyWordDebounce && keyWordDebounce !== '') {
      const categoryFilter = categoryInit?.filter(p =>
        p.name.toLowerCase().trim().includes(keyWordDebounce.toLowerCase()) ||
        p.slug.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
        p.products?.length == keyWordDebounce
      );
      setCategory(categoryFilter);
    } else {
      setCategory(categoryInit);
    }
  }, [keyWordDebounce]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa!",
      cancelButtonText: 'Không'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteCategory(id)
          const newCategory = category.filter(c => c._id != id)
          setCategory(newCategory)

          Swal.fire({
            title: 'Xóa thành công!',
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
      const res = await deleteManyCategory(listCategoryChecked)
      // Set lại state list sản phẩm khác với list sản phẩm đã bị xóa.
      const categoryInAOnly = category.filter(itemA => {
        return !listCategoryChecked.some(itemB => itemB._id == itemA._id);
      });
      setCategory(categoryInAOnly)

      Swal.fire({
        title: "Xóa thành công!",
        icon: "success"
      })
    } catch (error) {
      console.log(error)
    }
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleViewClick = (categoryId) => {
    dispatch(selectCategory(categoryId)); // Dispatch action khi nhấp vào nút
    navigate('/admin/products'); // Chuyển hướng đến trang admin/products
  };
  const columns: ColumnsType<CategoryType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: '8%',
      align: 'center',
      render: (value, record, index) => index + 1,
    },

    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: '25%',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'products',
      render(value, record, index) {
        return <p>{record?.products?.length} sản phẩm</p>
      },
      width: '20%',
      align: 'center',
      sorter: (a, b) => a.products.length - b.products.length,
    },
    {
      title: 'Mô tả',
      dataIndex: 'slug',
    },
    {
      title: 'Chi tiết',
      dataIndex: '_id',
      align: "center",
      width: '10%',
      render(value, record, index) {
        const { _id } = record;

        return (
          <>
            {/* <Link to={`/admin/category/${_id}`}> */}
            <button onClick={() => handleViewClick(_id)} // Dispatch action khi nhấp vào nút
              className="border btn text-sm text-black"
            >Xem</button>
            {/* </Link> */}
          </>
        );
      },
    },
    {
      title: 'Hành động',
      width: '14%',
      align: "center",
      key: '',
      render: (value, record, index) => (
        <Space size="small">
          {
            permissions?.includes('updateCategory') ?
              <Link to={`/admin/category/update/${record?._id}`}>
                <button aria-label='edit' type="button" className="btn btn-success bg-green-600">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </Link> : null
          }
          {
            permissions?.includes('deleteCategory') ?
              <button aria-label='delete' type="button" onClick={() => handleDelete(String(record?._id))} className="btn btn-danger bg-red-600 ml-1">
                <i className="fa-regular fa-trash-can"></i>
              </button> : null
          }
        </Space>
      ),
    },
  ];

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

  return <>
    <>
      <Table className='h-[100vh]'
        title={() => (
          <div className='flex justify-between py-3 mx-3'>
            <h3 className='font-bold text-3xl'>Danh mục sản phẩm</h3>
            <div className='flex '>
              <div>
                {
                  listCategoryChecked?.length > 1 ? (
                    <button onClick={handleDeleteMany} className='btn btn-primary'>Xóa các danh mục đã chọn</button>) : undefined
                }
              </div>

              <Link to={'/admin/category/add'}>
                <button className='btn btn-primary ml-2'>Thêm Danh Mục</button>
              </Link>
            </div>
          </div>
        )}
        loading={isLoading}
        size='middle'
        rowKey='_id'
        expandable={{}}
        rowSelection={{
          onSelect: (record, selected, selectedRows) => {
            // console.log(record, selected, selectedRows);
            setListCategoryChecked(selectedRows);
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            // console.log(selected, selectedRows, changeRows);
            setListCategoryChecked(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            // console.log(selectedRowKeys, selectedRows);
            setListCategoryChecked(selectedRows);
          }
        }}
        pagination={{ position: ['bottomCenter'] }}
        columns={columns?.map((item) => ({ ...item }))}
        dataSource={category}
      // scroll={{ y: '65vh', x: true }}
      />
    </>
  </>;
};

export default ListCategory;