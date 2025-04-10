import { Image, Switch, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import { formatCurrency } from '../../../utils/products';
import { deleteManyProduct, deleteProduct, updateActiveProduct } from '../../../services/products';
import { useProductsNoPaginate } from '../../../hooks/apis/products';
import { useCategoryNoPaginate } from '../../../hooks/apis/category';
import { ProductType } from '../../../common/type';
import { useColumnSearch } from '../../../hooks/useColumnSearch';
import moment, { MomentInput } from 'moment';
import { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { useUser } from '../../../hooks/apis/users';
import { useRole } from '../../../hooks/apis/roles';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../utils/debouce';

const ListProduct = () => {
    document.title = 'Quản lý sản phẩm'
    const [products, setProducts] = useState([])
    const [category, setCategory] = useState([])
    const [productsInit, setProductsInit] = useState([])
    const [listProductChecked, setListProductChecked] = useState<ProductType[]>([]);


    const selectedCategoryId = useSelector((state: { selectedCategory: any }) => state.selectedCategory);
    // console.log(selectedCategoryId)

    // Search
    const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<ProductType>();

    const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)
    const keyWordDebounce = useDebounce(keyWordSearch, 700)

    useEffect(() => {
        if (keyWordDebounce && keyWordDebounce !== '') {
            const productFilter = productsInit.filter(p =>
                p.name.toLowerCase().trim().includes(keyWordDebounce.toLowerCase()) ||
                p.description.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.categoryId.trim().includes(keyWordDebounce.toLowerCase()) ||
                category?.filter(c => c._id == p.categoryId)[0]?.name.trim().toLowerCase().includes(keyWordDebounce.toLowerCase())

            );
            setProducts(productFilter);
        } else {
            setProducts(productsInit);
        }
    }, [keyWordDebounce]);

    //fetchProduct
    const { data, isLoading } = useProductsNoPaginate()
    useEffect(() => {
        setProducts(data?.data)
        setProductsInit(data?.data)
    }, [data]);

    // get all category
    const { data: listCategoryNoPaginate } = useCategoryNoPaginate()
    useEffect(() => {
        setCategory(listCategoryNoPaginate?.data)
    }, [listCategoryNoPaginate]);

    // delete
    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Xác nhận xóa!",
            text: "Bạn có muốn xóa sản phẩm này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: 'Không'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteProduct(id)
                    const newProduct = products.filter(p => p._id != id)
                    setProducts(newProduct)

                    // Xóa sản phẩm mà admin đã xóa khỏi cart của người dùng
                    // await deleteProductCartFromAdmin({ productId: id })

                    Swal.fire({
                        title: res.data.message,
                        icon: "success"
                    })
                } catch (error) {
                    Swal.fire({
                        title: "Xóa sản phẩm thất bại!",
                        text: error?.response?.data?.message,
                        icon: "error"
                    })
                }
            }
        });
    }

    // deletemany
    const handleDeleteMany = async () => {
        if (!confirm("Xác nhận xóa nhiều sản phẩm ?")) return

        try {
            const res = await deleteManyProduct(listProductChecked)
            // Set lại state list sản phẩm khác với list sản phẩm đã bị xóa.
            const productsInAOnly = products.filter(itemA => {
                return !listProductChecked.some(itemB => itemB._id == itemA._id);
            });
            setProducts(productsInAOnly)

            Swal.fire({
                title: "Xóa nhiều sản phẩm thành công!",
                icon: "success"
            })
        } catch (error) {
            console.log(error)
        }
    }

    // check trang thai
    const onChangeActive = async (checked: boolean, id: string) => {
        const updateActive: { _id: string, isActive: boolean } = {
            _id: id,
            isActive: checked
        }
        // console.log(updateActive);

        updateActiveProduct(updateActive)
            .then(res => {
                const newProduct = products.map(p => p._id == id ? { ...p, isActive: checked } : p)
                setProducts(newProduct)
                toast.success("Cập nhật trạng thái thành công!")
            })
            .catch(error => {
                toast.error("Cập nhật trạng thái thất bại!")
                console.error(error)
            })
    };


    //columns
    const columns: ColumnsType<ProductType> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            width: '5%',
            align: 'center',
            render: (value, record, index) => index + 1,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            width: '13%',
            ...getColumnSearchProps('name'),

        },


        {
            title: 'Giá bán',
            dataIndex: 'sizes',
            render(value, record, index) {
                return (
                    <p>
                        <span>{formatCurrency(Math.min(...record?.sizes.map(size => size.price)))} </span>
                        {record?.sizes.length > 1 ? <span className=''>{' - ' + formatCurrency(Math.max(...record?.sizes.map(size => size.price)))}</span> : undefined}
                    </p>
                );
                // return <p>

                //     <span>{formatCurrency(record?.sizes[0]?.price)} </span>
                //     {record?.sizes?.length > 1 ? <span className=''>{' - ' + formatCurrency(record?.sizes[record?.sizes?.length - 1]?.price)}</span> : undefined}
                // </p>
            },
            width: '13%',
            sorter: (a, b) => a.sizes[0].price - b.sizes[0].price,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (value, record, index) => (
                <p className="text-gray-900 line-clamp-1 whitespace-no-wrap">
                    {record?.description}
                </p>
            ),
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            render(value, record, index) {
                return <div>
                    <Image
                        style={{ objectFit: 'contain' }}

                        src={record?.images[0]?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                        placeholder={
                            <Image
                                preview={false}
                                src="https://i.pinimg.com/originals/2e/60/07/2e60079f1e36b5c7681f0996a79e8af4.jpg"
                                width={100}
                            />
                        }
                    />
                </div>
            },
            width: '7%'
        },
        {
            title: 'Số lượng',
            align: 'center',
            dataIndex: 'sizes',
            render(value, record, index) {
                return <p>{record?.sizes?.reduce((a, b) => a += b.quantity, 0)}</p>
            },
            sorter: (a, b) => {
                const totalQuantityA = a.sizes.reduce((total, size) => total + size.quantity, 0);
                const totalQuantityB = b.sizes.reduce((total, size) => total + size.quantity, 0);
                return totalQuantityA - totalQuantityB;
            },
            width: '8%'
        },

        {
            title: 'Danh mục',
            width: '10%',
            dataIndex: 'categoryId',
            render: (value, record, index) => (
                <p className="text-gray-900 whitespace-no-wrap">
                    {(category?.find(i => i?._id == record.categoryId))?.name || 'Chưa có danh mục'}
                </p>
            ),
            filters: [
                ...(category?.map((cate) => {
                    // console.log(cate);
                    return ({
                        text: cate?.name,
                        value: cate._id,
                    })
                }) || []),
                {
                    text: 'Chưa có danh mục',
                    value: 'unknown',
                }
            ],
            defaultFilteredValue: selectedCategoryId ? [selectedCategoryId] : null,
            onFilter: (value, record) => {
                console.log(value, record.categoryId);
                if (value === 'unknown') {
                    // trả về true nếu id không thuộc bảng category
                    return !category?.some(cate => cate._id === record?.categoryId);
                }
                return String(record?.categoryId) === value
            },
            // filteredValue: selectedCategoryId ? [selectedCategoryId] : null,
        },
        {
            title: 'Ngày thêm',
            dataIndex: 'createdAt',
            render: (value, record, index) => moment(record?.createdAt as MomentInput).format("DD/MM/YYYY"),
            width: '12%',
            // sorter: (a, b) => moment(a.createdAt as MomentInput).unix() - moment(b.createdAt as MomentInput).unix(),
            // defaultSortOrder: 'descend',
        },
        {
            title: 'Hiển thị',
            dataIndex: 'isActive',
            render: (value, record, index) => (
                <span onClick={(event) => event.stopPropagation()}>
                    <Switch
                        defaultChecked={record?.isActive}
                        onChange={(checked) => onChangeActive(checked, String(record?._id))}
                    />
                </span>
            ),
            width: '9%',
            fixed: 'right',
            filters: [
                {
                    text: 'Hiển thị',
                    value: true,
                },
                {
                    text: 'Không hiển thị',
                    value: false,
                },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Hành động',
            width: '8%',
            key: '',
            align: "center",
            render: (value, record, index) => (
                <Space size="small">
                    {
                        permissions?.includes('updateProduct') ?
                            <Link to={`/admin/products/update/${record?._id}`}>
                                <button type="button" className="btn btn-success bg-green-600"><i className="fa-solid fa-pen-to-square"></i></button>
                            </Link> : null
                    }

                    {
                        permissions?.includes('deleteProduct') ?
                            <button onClick={() => handleDelete(String(record?._id))} type="button" className="btn btn-danger bg-red-600 ml-1"><i className="fa-regular fa-trash-can"></i></button> :
                            null

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

    return (
        <>
            <Table className='h-[100vh]'
                title={() => (
                    <div className='flex justify-between py-3 mx-3'>
                        <h3 className='font-bold text-3xl'>Sản phẩm</h3>
                        <div className='flex '>
                            <div>
                                {
                                    listProductChecked?.length > 0 ? (
                                        <button onClick={handleDeleteMany} className='btn btn-primary'>Xóa các sản phẩm đã chọn</button>) : undefined
                                }
                            </div>

                            <Link to={'/admin/products/add'}>
                                <button className='btn btn-primary ml-2'>Thêm sản phẩm</button>
                            </Link>
                        </div>
                    </div >)}
                loading={isLoading}
                size='middle'
                rowKey='_id'
                expandable={{
                    expandedRowRender: (record) => <div className='px-5 text-md'>
                        <h4 className='text-lg font-semibold'>Thông tin sản phẩm:</h4>
                        <p><b>Tên sản phẩm: </b>{record.name}</p>
                        <p><b>Mô tả:</b> {record.description}</p>
                        <p><b>Trạng thái:</b> {record.isActive ? 'Hiển thị' : 'Không hiển thị'}</p>
                        <p><b>Hình ảnh:</b></p>
                        {record.images.map((image, index) => (
                            <Image
                                style={{ objectFit: 'contain' }}
                                width={70}
                                className='p-2'
                                key={index}
                                src={record?.images[0]?.response?.urls[0] || 'https://static.thenounproject.com/png/504708-200.png'}
                                placeholder={
                                    <Image
                                        preview={false}
                                        src="https://i.pinimg.com/originals/2e/60/07/2e60079f1e36b5c7681f0996a79e8af4.jpg"
                                        width={100}
                                    />
                                }
                            />
                        ))}
                        {record.sizes.map((size, index) => (
                            <p key={index}>
                                <b>Size:</b> {size.size},<b> Giá:</b> {size.price}, <b>Số lượng:</b> {size.quantity}
                            </p>
                        ))}
                    </div>
                    ,
                }}
                rowSelection={{
                    onSelect: (record, selected, selectedRows) => {
                        console.log(record, selected, selectedRows);
                        setListProductChecked(selectedRows);
                    },
                    onSelectAll: (selected, selectedRows, changeRows) => {
                        console.log(selected, selectedRows, changeRows);
                        setListProductChecked(selectedRows);
                    },
                    onChange: (selectedRowKeys, selectedRows) => {
                        console.log(selectedRowKeys, selectedRows);
                        setListProductChecked(selectedRows);
                    }

                }}
                pagination={{ position: ['bottomCenter'] }}
                columns={columns.map((item) => ({ ...item }))}
                dataSource={products}
                // scroll={{ y: '60vh', x: true }}
            />

        </>

    );
};

export default ListProduct;