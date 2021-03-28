import { WorkhubClient } from "..";
import { Postman } from "../postman";

export class Auth {
    private client: WorkhubClient;
    private postman: Postman;

    constructor(client: WorkhubClient, postman: Postman) {
        this.client = client;
        this.postman = postman
    }

    async authenticate(username: string, password: string) {

        //Write to reducer
        let resp = await this.postman.post('/login', {
            strategy: 'jwt',
            username: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (resp.data.token) {
            this.client.setAccessToken(resp.data.token)
            localStorage.setItem('token', resp.data.token) 
            return true;
        } else {
            return { error: resp.data.error }
        }
    }

    async forgotPassword(email: string) {
        let data = await this.postman.post('/forgot', {
            email
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return data.data;
    }

    async resetPassword(password: string, token: string) {
        let data = await this.postman.post('/reset', {
            password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        return data.data;
    }

    async setupHub(hubUrl: string, hubName: string) {
        this.client.updateBaseURL(hubUrl);

        let data = await this.postman.post('/provision', {
            device: "TeamHub",
            hubName: hubName
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data.data;
    }

    async signupInfo(token: string) {
        let resp = await this.postman.get(`/signup`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return resp.data;
    }

    async trySignup(signup_info: {}, token: string) {
        let resp = await this.postman.post(`/signup`, { ...signup_info }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        })
        return resp.data;
    }
}