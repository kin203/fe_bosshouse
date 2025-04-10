import { useEffect, useState } from "react";
import { Button } from 'antd';
import { Link } from "react-router-dom";
import { deleteRoleApi, getAll } from "../../services/roles";
import Swal from "sweetalert2";

const Access = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getAll()
      setRoles(res?.data?.docs);
    })()
  }, []);

  // Hàm để xóa vai trò
  const deleteRole = async (id) => {
    Swal.fire({
      title: "Xác nhận xóa!",
      text: "Bạn có muốn xóa vai trò này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa!",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteRoleApi(id);
          alert('Xóa vai trò thành công!');
          setRoles(roles.filter(role => role._id != id));
        } catch (error) {
          console.log(error)
        }
      }
    });
  };


  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Danh sách quyền quản trị</h1>

      {/* Nút thêm vai trò */}
      <div className="mb-4">
        <Link to={'/admin/access/add'}><Button type="default">Thêm</Button></Link>
      </div>

      {/* Danh sách vai trò */}
      <ul className="space-y-4">
        {roles.map((role: any, i) => {
          // console.log(role)
          return <li key={i} className="flex items-center justify-between bg-white p-4 rounded-md shadow-md">
            <span className="text-lg">{role?.role}</span>
            <div className="space-x-4">
              <Link to={`/admin/access/update/${role._id}`}>
                <Button type="default">Sửa</Button>
              </Link>
              {
                role?.role != "Administrator" ? <Button type="default" onClick={() => deleteRole(role._id)}>Xóa</Button> : undefined
              }
              
            </div>
          </li>
        })}
      </ul>
    </div>
  );
};

export default Access;
