import api from "./api";

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};