import moment from "moment";

export function timeAgo(timestamp) {
    const now: any = new Date();
    const past: any = new Date(timestamp);

    const seconds = Math.floor((now - past) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) {
        return `${seconds} giây trước`;
    } else if (minutes < 60) {
        return `${minutes} phút trước`;
    } else if (hours < 24) {
        return `${hours} giờ trước`;
    } else if (days < 30) {
        return `${days} ngày trước`;
    } else if (months < 12) {
        return `${months} tháng trước`;
    } else {
        return `${years} năm trước`;
    }
}

export function getTimeRemaining(startTime, endTime) {
    // Chuyển đổi thời gian sang dạng đối tượng Moment
    const start = moment(startTime);
    const end = moment(endTime);
    const currentTime = moment();

    // Tính thời gian còn lại để đến bắt đầu và kết thúc
    const timeUntilStart = start.diff(currentTime);
    const timeUntilEnd = end.diff(currentTime);

    // Chuyển đổi thời gian còn lại sang đơn vị giờ, phút, giây
    const startDuration = moment.duration(timeUntilStart);
    const endDuration = moment.duration(timeUntilEnd);

    const hours = Math.floor(startDuration.asHours());
    const minutes = Math.floor(startDuration.minutes());
    const seconds = Math.floor(startDuration.seconds());

    const endHours = Math.floor(endDuration.asHours());
    const endMinutes = Math.floor(endDuration.minutes());
    const endSeconds = Math.floor(endDuration.seconds());

    let text = '';

    if (timeUntilStart > 0 && timeUntilEnd > 0) {
        if (timeUntilStart < timeUntilEnd) {
            if (timeUntilStart < 86400000) { // 86400000 milliseconds = 1 day
                text += `Sắp diễn ra: ${hours}:${minutes}:${seconds}.`;
            } else {
                const days = Math.floor(startDuration.asDays());
                text += `Sắp diễn ra: ${days} ngày.`;
            }
        } else {
            if (timeUntilEnd < 86400000) { // 86400000 milliseconds = 1 day
                text += `Thời gian còn lại: ${endHours}:${endMinutes}:${endSeconds}.`;
            } else {
                const days = Math.floor(endDuration.asDays());
                text += `Thời gian còn lại: ${days} ngày.`;
            }
        }
    } else if (timeUntilStart > 0) {
        if (timeUntilStart < 86400000) { // 86400000 milliseconds = 1 day
            text += `Sắp diễn ra: ${hours}:${minutes}:${seconds}.`;
        } else {
            const days = Math.floor(startDuration.asDays());
            text += `Sắp diễn ra: ${days} ngày.`;
        }
    } else if (timeUntilEnd > 0) {
        if (timeUntilEnd < 86400000) { // 86400000 milliseconds = 1 day
            text += `Thời gian còn lại: ${endHours}:${endMinutes}:${endSeconds}.`;
        } else {
            const days = Math.floor(endDuration.asDays());
            text += `Thời gian còn lại: ${days} ngày.`;
        }
    } else {
        text += `Đã kết thúc.`;
    }

    return text;
}