import axios from 'axios';



let customAxios = axios.create({baseURL:"http://Yetasveerkiskihaiserver-env.eba-mfgmqh2i.ap-south-1.elasticbeanstalk.com/"});

// let customAxios = axios.create({baseURL:"http://84a08bf8.ngrok.io/"});

export default customAxios;