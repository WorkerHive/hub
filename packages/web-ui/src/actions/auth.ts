import isElectron from "is-electron";
import fetch from "node-fetch";
import { UserInfo } from "../views/Auth/Signup";
    
let hubUrl: string = (isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin)) || ""

if(hubUrl?.indexOf('localhost') < 0) hubUrl += "/api"

export const setupHub = (_hubUrl: string, hubName : string) => {
    if(_hubUrl){
        hubUrl = _hubUrl + '/api'
        localStorage.setItem('workhub-api', _hubUrl)
    }

    return fetch(`${hubUrl}/provision`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            device: "TeamHub",
            hubName: hubName
        })
    }).then((r) => r.json())
}

export const authenticate = (username : string, password : string) => {

    return fetch(`${hubUrl}/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            strategy: 'jwt',
            username: username,
            password: password
        })
    }).then((r) => r.json())
}

export const signupInfo = (token: string) => {
    return fetch(`${hubUrl}/signup`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }).then((r) => r.json())
}

export const trySignup = (signup_info: UserInfo, token: string) => {
    return fetch(`${hubUrl}/signup`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            ...signup_info
        })
    }).then((r) => r.json())
}

export const forgotPassword = (email: string) => {

    return fetch(`${hubUrl}/forgot`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email
        })
    }).then((r) => r.json())
}

export const resetPassword = (password: string, token: string) => {
    return fetch(`${hubUrl}/reset`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            password
        })
    }).then((r) => r.json())
}