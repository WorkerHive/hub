import axios, { AxiosInstance } from 'axios';

export class Postman {
    private axiosInst : AxiosInstance;

    constructor(url: string){
        this.axiosInst = axios.create({
            baseURL: url,
            headers: {}
        })
    }
    
    updateBaseURL(url?: string){
        this.axiosInst = axios.create({
            baseURL: url,
            headers: {}
        })
    }

    get(slug : string, headers: any){
        return this.axiosInst.get(slug, headers)
    }

    post(slug : string, body: any, headers: any){
        return this.axiosInst.post(slug, body, headers)
    }
}
