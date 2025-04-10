import instance from "./config/instance"


export const sendMail = async (data) => {
    return await instance.post(`/mail/sendmail`, data)
}