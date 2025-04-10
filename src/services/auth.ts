import instance from "./config/instance";

export const signIn = (data) => {
  return instance.post(`/users/signin`, data);
};

export const forgotPassword = async (data:any) => {
  return await instance.post(`/users/fogotpassword`, data);
};
export const signUp = (data) => {
  return instance.post(`/users/signup`, data);
};

export const changePassword = (data) => {
  return instance.patch(`/users/changePassword`, data);
};