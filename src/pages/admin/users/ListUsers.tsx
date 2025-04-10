import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteManyUsers, deleteUsers, getAllNoPaginate } from '../../../services/users';
import { Pagination, Space, Table } from 'antd';
import { UserType } from '../../../common/type';
import { useColumnSearch } from '../../../hooks/useColumnSearch';
import { ColumnsType } from 'antd/es/table';

import { getAllUsers } from '../../../services/users';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { Skeleton, Typography } from '@mui/material';
import { useUser, useUsers } from '../../../hooks/apis/users';
import { useGetRoles, useRole } from '../../../hooks/apis/roles';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../utils/debouce';

const ListUsers = () => {
    document.title = 'Quản lý người dùng'
    const [users, setUsers] = useState([])
    const [usersInit, setUsersInit] = useState([])
    const [isLoading, setLoading] = useState(false);
    const [listUserChecked, setListUserChecked] = useState([])
    const [roles, setRoles] = useState([]);

    // Search
    const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<UserType>();

    //Get ROLES
    const { data } = useGetRoles()
    useEffect(() => {
        setRoles(data?.data?.docs)
    }, [data]);


    //FETCH USERS
    const { data: listUserNoPaginate } = useUsers()
    useEffect(() => {
        setUsers(listUserNoPaginate?.data)
        setUsersInit(listUserNoPaginate?.data)
    }, [listUserNoPaginate]);

    const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)
    const keyWordDebounce = useDebounce(keyWordSearch, 700)

    useEffect(() => {
        if (keyWordDebounce && keyWordDebounce !== '') {
            const userFilter = usersInit?.filter(p =>
                p.username.toLowerCase().trim().includes(keyWordDebounce.toLowerCase()) ||
                p.email.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.address.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p?.phoneNumber == keyWordDebounce ||
                p._id.trim().toLowerCase().includes(keyWordDebounce.toLowerCase())
            );
            // console.log(userFilter)
            setUsers(userFilter);
        } else {
            setUsers(usersInit);
        }
    }, [keyWordDebounce]);


    //DELETE USER
    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Xác nhận xóa!",
            text: "Bạn có muốn xóa tài khoản này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: 'Không'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteUsers(id)
                    const newProduct = users.filter(p => p._id != id)
                    setUsers(newProduct)

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
    //deletemany 
    const handleDeleteManyUsers = async () => {
        if (!confirm("Xác nhận xóa các tài khoản đã chọn?")) return
        try {
            const res = await deleteManyUsers(listUserChecked)
            // Set lại state list sản phẩm khác với list sản phẩm đã bị xóa.
            const UsersInAOnly = users.filter(itemA => {
                return !listUserChecked.some(itemB => itemB._id == itemA._id);
            });
            setUsers(UsersInAOnly)

            Swal.fire({
                title: "Xóa thành công!",
                icon: "success"
            })
        } catch (error) {
            console.log(error)
        }
    }


    //Column
    const columns: ColumnsType<UserType> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            width: '4%',
            align: 'center',
            render: (value, record, index) => index + 1,
        },
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            width: '6%',

            align: 'center',
            render(value, record, index) {
                return <div className=''>
                    <img className="w-full h-full rounded-full"
                        src={record?.avatar}
                        alt="" />
                </div>
            }
        },
        {
            title: 'Tên tài khoản',
            dataIndex: 'username',
            width: '15%',
            ...getColumnSearchProps('username'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: '18%',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            width: '11%',
            ...getColumnSearchProps('phoneNumber')
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            ...getColumnSearchProps('address'),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleId',
            render: (value, record, index) => (
                <p className="text-gray-900 whitespace-no-wrap">
                    {(roles?.find(i => i?._id == record.roleId))?.role || 'Khách hàng'}
                </p>
            ),
            filters: [
                ...(roles?.map((role) => ({
                    text: role.role,
                    value: role._id,
                })) || []),
                {
                    text: 'Khách hàng',
                    value: 'guest'
                }],

            onFilter: (value, record) => record.roleId === value,

        },

        {
            title: 'Hành động',
            key: '',
            width: "8%",
            align: "center",
            render: (value, record, index) => (
                <Space size="small">
                    {
                        permissions?.includes('updateUser') ?
                            <Link to={`/admin/users/update/${record._id}`}>
                                <button type="button" className="btn btn-success bg-green-600"><i className="fa-solid fa-pen-to-square"></i></button>
                            </Link>
                            : null
                    }
                    {
                        permissions?.includes('deleteUser') ?
                            <button onClick={() => handleDelete(String(record?._id))} type="button" className="btn btn-danger bg-red-600 ml-1"><i className="fa-regular fa-trash-can"></i></button>
                            : null
                    }
                </Space>
            ),
        },
    ];

    // const menuProps = {
    //     items,
    //     onClick: handleMenuClick,
    // };


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
                        <h3 className='font-bold text-3xl'>Tài khoản</h3>
                        <div className='flex '>
                            <div>
                                {
                                    listUserChecked?.length > 0 ? (
                                        <button onClick={handleDeleteManyUsers} className='btn btn-primary'>Xóa các tài khoản đã chọn</button>) : undefined
                                }
                            </div>

                            {/* <Link to={'/admin/users/add'}>
                                <button className='btn btn-primary ml-2'>Thêm tài khoản</button>
                            </Link> */}
                        </div>
                    </div>
                )}
                loading={isLoading}
                size='middle'
                rowKey='_id'
                expandable={{
                    expandedRowRender: (record) => <p className='p-3'>
                        <b>Tên tài khoản:</b> {record.username} <br />
                        <b>Email:</b> {record.email} <br />
                        <b>Số điện thoại:</b> 0{record.phoneNumber} <br />
                        <b>Địa chỉ:</b> {record.address} <br />
                        <b>Vai trò:</b> {(roles?.find(i => i?._id == record.roleId))?.role || 'Khách hàng'}<br />
                    </p>,
                }}
                rowSelection={{
                    onSelect: (record, selected, selectedRows) => {
                        // console.log(record, selected, selectedRows);
                        setListUserChecked(selectedRows);
                    },
                    onSelectAll: (selected, selectedRows, changeRows) => {
                        // console.log(selected, selectedRows, changeRows);
                        setListUserChecked(selectedRows);
                    },
                    onChange: (selectedRowKeys, selectedRows) => {
                        // console.log(selectedRowKeys, selectedRows);
                        setListUserChecked(selectedRows);
                    }
                }}
                pagination={{ position: ['bottomCenter'] }}
                columns={columns.map((item) => ({ ...item }))}
                dataSource={users}
                // scroll={{ y: '65vh', x: true }}
            />

        </>
    );
}
export default ListUsers;