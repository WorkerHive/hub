import isElectron from "is-electron";
import fetch from "node-fetch";
    
let hubUrl: string = (isElectron() ? localStorage.getItem('workhub-api') : (process.env.NODE_ENV == "development" ? 'https://rainbow.workhub.services' || 'http://localhost:4002' : window.location.origin)) || ""

if(hubUrl?.indexOf('localhost') < 0) hubUrl += "/api"

