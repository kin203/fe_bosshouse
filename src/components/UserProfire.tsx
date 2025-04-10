import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/apis/users';
import { logOut } from '../utils/auth';

const UserProfile = () => {
    const [userQ, setUserQ] = useState(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };
    const closeDropdown = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', closeDropdown);
        return () => {
            document.removeEventListener('mousedown', closeDropdown);
        };
    }, []);

    const userSession = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : undefined;
    const { data } = useUser(userSession?._id)
    
    useEffect(() => {
        if (data) {
            setUserQ(data?.data);
        }
    }, [data]);

    return (
        <>
            <li className={`nav-item dropdown no-arrow ${isDropdownOpen ? 'show' : ''}`} ref={dropdownRef}>
                <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    id="userDropdown"
                    role="button"
                    onClick={toggleDropdown}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen ? 'true' : 'false'}
                >
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">{userQ?.username}</span>
                    <img style={{ objectFit: 'contain', display: "block", borderRadius: "100%" }} width={35} src={userQ?.avatar} />
                </Link>
                {/* Dropdown - User Information */}
                <div
                    className={`dropdown-menu dropdown-menu-right cursor-pointer shadow animated--grow-in ${isDropdownOpen ? 'show' : ''}`}
                    aria-labelledby="userDropdown"
                >
                    <Link className="dropdown-item" to="/admin/adminProfile">
                        <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
                        Hồ sơ
                    </Link>

                    <div className="dropdown-divider" />
                    <div onClick={() => {
                        logOut();
                    }}
                        className="dropdown-item"
                        data-toggle="modal"
                        data-target="#logoutModal"
                    >
                        <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                        Đăng xuất
                    </div>
                </div>
            </li>
        </>
    );
};

export default UserProfile;
