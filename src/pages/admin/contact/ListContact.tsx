import type { MenuProps } from "antd";
import { Button, Dropdown, Select, Space, Pagination, Table } from "antd";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading/Loading";
import Swal from "sweetalert2";
import { deleteContact, deleteManyContact, getAllContact, updateContact, updateProcessed, } from "../../../services/contact";
import { useSelector } from "react-redux";
import { useDebounce } from "../../../utils/debouce";
import { DownOutlined } from "@ant-design/icons";
import { Skeleton, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { ContactType } from "../../../common/type";
import { ColumnsType } from "antd/es/table";
import { useColumnSearch } from "../../../hooks/useColumnSearch";
import { useUser } from "../../../hooks/apis/users";
import { useRole } from "../../../hooks/apis/roles";
import { useContactNoPaginate } from "../../../hooks/apis/contact";
import moment from "moment";

const ListContact = () => {
    const [current, setCurrent] = useState(1);
    const [contacts, setContact] = useState([]);
    const [contactsInit, setContactInit] = useState([]);
    const [listContactChecked, setListContactChecked] = useState([]);
    const [isLoading, setLoading] = useState(false);
    document.title = 'Quản lý liên hệ'

    const { data: listContactNoPaginate } = useContactNoPaginate()
    useEffect(() => {
        setContact(listContactNoPaginate?.data)
        setContactInit(listContactNoPaginate?.data)
    }, [listContactNoPaginate]);

    const { keyWordSearch } = useSelector((state: { keyword: any }) => state.keyword)
    const keyWordDebounce = useDebounce(keyWordSearch, 700)

    useEffect(() => {
        if (keyWordDebounce && keyWordDebounce !== '') {
            const contactFilter = contactsInit?.filter(p =>
                p.fullName.toLowerCase().trim().includes(keyWordDebounce.toLowerCase()) ||
                p.email.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.IsProcessed.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.content.trim().toLowerCase().includes(keyWordDebounce.toLowerCase()) ||
                p.phoneNumber == keyWordDebounce
            );
            // console.log(userFilter)
            setContact(contactFilter);
        } else {
            setContact(contactsInit);
        }
    }, [keyWordDebounce]);

    // delete
    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Xác nhận xóa!",
            text: "Bạn có muốn xóa liên hệ này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Không",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteContact(id);
                    const newProduct = contacts.filter((p) => p._id != id);
                    setContact(newProduct);

                    Swal.fire({
                        // title: "Xóa liên hệ thành công!",
                        text: res.data.message,
                        icon: "success",
                    });
                } catch (error) {
                    Swal.fire({
                        title: "Xóa liên hệ  thất bại!",
                        text: error?.response?.data?.message,
                        icon: "error",
                    });
                }
            }
        });
    };

    // deletemany
    const handleDeleteManyContact = async () => {
        if (!confirm("Xác nhận xóa nhiều liên hệ  ?")) return;

        try {
            const res = await deleteManyContact(listContactChecked);
            // Set lại state list liên hệ khác với list liên hệ đã bị xóa.
            const contactsInAOnly = contacts.filter((itemA) => {
                return !listContactChecked.some((itemB) => itemB._id == itemA._id);
            });
            setContact(contactsInAOnly);

            Swal.fire({
                title: "Xóa nhiều liên hệ thành công!",
                icon: "success",
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleChangeProcessed = async (value, data) => {
        try {
            // Update processed status in the database
            const res = await updateProcessed({ _id: data._id, IsProcessed: value });
            // Update state contacts with the new processed status
            setContact((prevContacts) =>
                prevContacts.map((contact) =>
                    contact._id == data._id ? { ...contact, IsProcessed: value } : contact
                )
            );

            toast.success("Cập nhật trạng thái thành công!")
        } catch (error) {
            console.error("Error updating processed status: ", error);
        }
    };
    // Search
    const { getColumnSearchProps, searchText, searchedColumn } = useColumnSearch<ContactType>();
    const columns: ColumnsType<ContactType> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            width: '4%',
            render: (value, record, index) => index + 1,
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'fullName',
            width: '15%',
            ...getColumnSearchProps('fullName'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: '20%',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            ...getColumnSearchProps('phoneNumber')
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            width: '20%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'IsProcessed',
            render: (value, record, index) => (
                <Select
                    value={value}
                    style={{ width: 150 }}
                    className={
                        value === "Chờ Phản Hồi"
                            ? ""
                            : value === "Đã Phản Hồi"
                                ? ""
                                : ""
                    }
                    onChange={(value) => handleChangeProcessed(value, record)}
                    options={[
                        {
                            value: "Chờ Phản Hồi",
                            label: "Chờ Phản Hồi",
                            _id: record?._id,
                            disabled: true
                        },
                        {
                            value: "Đã Phản Hồi",
                            label: "Đã Phản Hồi",
                            _id: record?._id,
                        },
                    ]}
                />
            ),

            filters: [
                {
                    text: 'Chờ Phản Hồi',
                    value: 'Chờ Phản Hồi'
                },
                {
                    text: 'Đã Phản Hồi',
                    value: 'Đã Phản Hồi'
                },
            ],
            onFilter(value: string, record) {
                return record.IsProcessed.indexOf(value) === 0;
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            width: '20%',
            render: (value) => moment(value).format('DD/MM/YYYY HH:mm:ss'),
        },
        {
            title: 'Hành động',
            width: '8%',
            key: 'action',
            align: "center",
            render: (value, record, index) => (
                <Space size="small">
                    {
                        permissions.includes('deleteContact') ?
                            <button aria-label='delete' type="button" onClick={() => handleDelete(String(record?._id))} className="btn text-base text-red-500">
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


    return (
        <>
            <Table className='h-[100vh]'
                title={() => (
                    <div className='flex'><h3 className='font-bold text-3xl'>Liên hệ</h3>
                        <div className='pl-3'>
                            {
                                listContactChecked?.length > 0 ? (
                                    <button onClick={handleDeleteManyContact} className='btn btn-primary'>Xóa các liên hệ đã chọn</button>) : undefined
                            }
                        </div></div>)}
                loading={isLoading}
                size='middle'
                rowKey='_id'
                rowSelection={{
                    onSelect: (record, selected, selectedRows) => {
                        console.log(record, selected, selectedRows);
                        setListContactChecked(selectedRows);
                    },
                    onSelectAll: (selected, selectedRows, changeRows) => {
                        console.log(selected, selectedRows, changeRows);
                        setListContactChecked(selectedRows);
                    },
                    onChange: (selectedRowKeys, selectedRows) => {
                        console.log(selectedRowKeys, selectedRows);
                        setListContactChecked(selectedRows);
                    }

                }}
                pagination={{ position: ['bottomCenter'] }}
                columns={columns.map((item) => ({ ...item }))}
                dataSource={contacts}
                // scroll={{ y: '65vh', x: true }}
            />
        </>
    );
};

export default ListContact;
