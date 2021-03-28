import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://rainbow.workhub.services/'
})

export default axiosInstance