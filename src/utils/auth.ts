import bcryptjs from "bcryptjs";

const checkPassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcryptjs.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error checking password:', error);
        return false;
    }
};

export default checkPassword;

export const logOut = () => {
    // Xóa các thông tin đăng nhập khỏi sessionStorage
    sessionStorage.removeItem("roleId");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    window.location.href = "/";
    // window.location.reload();
};