const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.RAPIDAPI_KEY;
const apiHost = 'yahoo-finance15.p.rapidapi.com';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: `https://${apiHost}`,
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost,
  },
});

// 定义通用的 GET 请求方法
const get = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error in API request:', error);
    throw error;
  }
};

module.exports = {
  get,
};
