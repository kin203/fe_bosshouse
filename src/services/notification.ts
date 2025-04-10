import instance from "./config/instance";

export const getAllToAdmin = () => {
    return instance.get(`/notification/getAllToAdmin?_order=desc`);
};

export const getAllToClient = () => {
    return instance.get(`/notification/getAllToClient`);
}

export const addNotification = (data) => {
    return instance.post(`/notification/add`, data);
}

export const updateStatusNotification = (data) => {
    return instance.post(`/notification/updateStatusNotification`, data);
}

export const updateAllStatusNotification = (data) => {
    return instance.post(`/notification/updateAllStatusNotification`, data);
}