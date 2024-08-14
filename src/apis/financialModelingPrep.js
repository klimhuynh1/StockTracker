import axios from "axios";

export const TOKEN = import.meta.env.VITE_FINANCIALMODELINGPREP_API_KEY;
export default axios.create({
  baseURL: "https://financialmodelingprep.com/api/v3",
});
