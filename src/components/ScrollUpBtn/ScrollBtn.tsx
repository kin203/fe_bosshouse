import React, { useState, useEffect } from "react";
import { UpCircleOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import './button.css'

const ScrollBtn = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowButton(window.scrollY > 200);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    return (
        <div>
            {showButton && (
                // <FloatButton onClick={scrollToTop} icon={<UpCircleOutlined />} style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 10 }} />
                // <button
                //     onClick={scrollToTop}
                //     className="fixed text-5xl right-3 bottom-3 z-10 border-blue-400 text-blue-300 rounded-full transition-all hover:text-blue-600 shadow"
                // >
                //     <UpCircleOutlined />
                // </button>
                <button className="Btn shadow-md" onClick={scrollToTop}>
                    <svg height="1.2em" className="arrow" viewBox="0 0 512 512"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"></path></svg>
                </button>
            )}
        </div>
    );
};

export default ScrollBtn;
