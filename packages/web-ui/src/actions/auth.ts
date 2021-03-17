import isElectron from "is-electron";
import fetch from "node-fetch";
import { UserInfo } from "../views/Signup";

export const authenticate = (username : string, password : string) => {
    const hubUrl = (isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin))

    return fetch(`${hubUrl}/api/login`, {
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

export const trySignup = (signup_info: UserInfo, token: string) => {
    const hubUrl = (isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin))
    return fetch(`${hubUrl}/api/signup`, {
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
    const hubUrl = (isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin))

    return fetch(`${hubUrl}/api/forgot`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email
        })
    }).then((r) => r.json())
}