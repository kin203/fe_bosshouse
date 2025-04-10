export function formatDateString(dateString) {
    // Tách dữ liệu ngày, tháng, năm, giờ, phút và giây từ chuỗi
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hours = dateString.slice(8, 10);
    const minutes = dateString.slice(10, 12);
    const seconds = dateString.slice(12, 14);

    // Định dạng lại ngày tháng theo định dạng mong muốn, ví dụ: dd/mm/yyyy hh:mm:ss
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}
