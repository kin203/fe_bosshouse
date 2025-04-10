import React from "react";
import { useUser } from "../../hooks/apis/users";
import { useRole } from "../../hooks/apis/roles";

const AdminProfile = () => {
    const userSession = sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))
        : undefined;
        
    const { data } = useUser(userSession?._id);

    const {data: role} = useRole(data?.data?.roleId)

    return (
        <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center justify-center mb-6">
                <img
                    src={data?.data?.avatar}
                    alt="Admin Avatar"
                    className="w-32 h-32 rounded-full border-4 border-blue-500"
                />
            </div>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {data?.data?.name}
                </h2>
                <p className="text-sm">Email: {data?.data?.email}</p>
                <p className="text-sm">Vai trò: {role?.data?.role}</p>
            </div>
            <div className="w-full border-t border-gray-200"></div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Thông tin liên hệ
                </h3>
                <ul>
                    <li className="flex items-center text-sm text-gray-600 mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-5a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Phone: {data?.data?.phoneNumber}</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-600 mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.708 3.292a1 1 0 10-1.416 1.415l8 8a1 1 0 001.415 0l8-8a1 1 0 00-1.415-1.415L12 10.586 5.122 3.707a1 1 0 00-1.414-.001z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Địa chỉ: {data?.data?.address}</span>
                    </li>
                </ul>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Thông tin khác
                </h3>
                <p className="text-sm text-gray-600">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta,
                    labore neque qui excepturi numquam fugit, amet culpa aliquam saepe,
                    sapiente quos. Molestiae molestias laboriosam eaque ab facilis veniam
                    temporibus ea!
                </p>
            </div>
        </div>
    );
};

export default AdminProfile;
