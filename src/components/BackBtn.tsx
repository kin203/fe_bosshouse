import { LeftOutlined } from '@ant-design/icons';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const BackBtn = () => {
    let navigate = useNavigate();
    return (
        <>
            <button onClick={() => navigate(-1)} className="absolute inline-flex items-center lg:ml-16 ml-8 mt-4 px-2 pb-3  hover:underline hover:transform hover:scale-105 duration-200 text-sm font-medium rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Quay lại
            </button>
        </>
    );
}

export default BackBtn