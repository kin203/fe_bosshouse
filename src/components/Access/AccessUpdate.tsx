import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addRole, getOne, updateRole } from "../../services/roles";
import { data } from "../../data/dataAccess.ts"
import Swal from "sweetalert2";
import { useUpdateRole } from "../../hooks/apis/roles.ts";

const AccessUpdate = () => {
  const next = useNavigate();
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [dataRole, setDateRole] = useState(null);
  const [nameRole, setNameRole] = useState(dataRole?.role);
  let mode = 'add';

  const { id } = useParams()
  if (id) mode = 'update'

  useEffect(() => {
    (async () => {
      const res = await getOne(id)
      setDateRole(res?.data)
    })()
  }, []);

  useEffect(() => {
    const nameValues = [];

    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.startsWith('name')) {
          nameValues.push(item[key]);
        }
      });
    });

    if (dataRole) {
      const permissions = dataRole.permissions || [];
      const checkedPermissions = permissions.filter(permission =>
        nameValues.includes(permission)
      );
      setCheckedPermissions(checkedPermissions);
    }
  }, [dataRole]);

  const onChecked = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setCheckedPermissions((prevPermissions) => [...prevPermissions, name]);
    } else {
      setCheckedPermissions((prevPermissions) =>
        prevPermissions.filter((permission) => permission !== name)
      );
    }
  };
  const { mutateAsync } = useUpdateRole()
  const onSubmit = async () => {
    if (mode == 'add') {
      try {
        const res = await addRole({
          role: nameRole,
          permissions: checkedPermissions
        });
        Swal.fire({
          title: 'Thêm vai trò thành công!',
          icon: 'success'
        })

        next("/admin/access")
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        mutateAsync({
          _id: dataRole._id,
          role: nameRole,
          permissions: checkedPermissions
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div className="container mx-auto flex justify-center items-center select-none ">
      {/* Quyền cho từng chức năng */}
      <div className="w-[60%] p-4 border">
        <h2 className="text-3xl text-center font-bold mb-4">Phân quyền cho chức năng</h2>
        <input className="w-full h-10 border rounded-md mb-3 p-2.5" type="text" defaultValue={dataRole?.role} readOnly={dataRole?.role.toLowerCase().includes('admin')} placeholder="Nhập tên quyền" onChange={(e) => setNameRole(e.target.value)} />
        <ul className="space-y-4 ">
          {data?.map((item, i) => (
            <li key={i} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{item.title}</span>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      onChange={onChecked}
                      name={item.nameView}
                      type="checkbox"
                      className="form-checkbox text-indigo-600 h-5 w-5"
                      checked={checkedPermissions.includes(item.nameView)}
                    />
                    <span className="ml-2 font-medium text-gray-700">Xem</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      onChange={onChecked}
                      name={item.nameAdd}
                      type="checkbox"
                      className="form-checkbox text-indigo-600 h-5 w-5"
                      checked={checkedPermissions.includes(item.nameAdd)}
                    />
                    <span className="ml-2 font-medium text-gray-700">Thêm</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      onChange={onChecked}
                      name={item.nameUpdate}
                      type="checkbox"
                      className="form-checkbox text-indigo-600 h-5 w-5"
                      checked={checkedPermissions.includes(item.nameUpdate)}
                    />
                    <span className="ml-2 font-medium text-gray-700">Sửa</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      onChange={onChecked}
                      name={item.nameDelete}
                      type="checkbox"
                      className="form-checkbox text-indigo-600 h-5 w-5"
                      checked={checkedPermissions.includes(item.nameDelete)}
                    />
                    <span className="ml-2 font-medium text-gray-700">Xóa</span>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button onClick={onSubmit} className="bg-blue-500 mt-5 ml-[46%] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Lưu</button>
      </div>
    </div>
  );
};

export default AccessUpdate;
