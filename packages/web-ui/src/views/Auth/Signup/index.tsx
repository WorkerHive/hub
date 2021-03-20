import { Button, Divider, Paper, TextField, Typography } from '@material-ui/core';
import React, {FC} from 'react';
import decode from 'jwt-decode';
import qs from 'qs';
import { isEqual } from 'lodash';
import './index.css';
import { trySignup } from 'web-ui/src/actions/auth';
import { withRouter } from 'react-router-dom';

export interface SignupProps {
    history?: any;
}

export interface UserInfo {
    username?: string;
    password?: string;
    confirm_password?: string;
    name?: string;
    email?: string;
    phone_number?: string;
}

const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicGVybWlzc2lvbnMiOlsiV29ya2Zsb3c6Y3JlYXRlIiwiV29ya2Zsb3c6cmVhZCIsIldvcmtmbG93OnVwZGF0ZSIsIldvcmtmbG93OmRlbGV0ZSIsIkNvbnRhY3RPcmdhbmlzYXRpb246Y3JlYXRlIiwiQ29udGFjdE9yZ2FuaXNhdGlvbjpyZWFkIiwiQ29udGFjdE9yZ2FuaXNhdGlvbjp1cGRhdGUiLCJDb250YWN0T3JnYW5pc2F0aW9uOmRlbGV0ZSIsIktub3dsZWRnZTpjcmVhdGUiLCJLbm93bGVkZ2U6cmVhZCIsIktub3dsZWRnZTp1cGRhdGUiLCJLbm93bGVkZ2U6ZGVsZXRlIiwiUHJvamVjdDpjcmVhdGUiLCJQcm9qZWN0OnJlYWQiLCJQcm9qZWN0OnVwZGF0ZSIsIlByb2plY3Q6ZGVsZXRlIiwiUm9sZTpjcmVhdGUiLCJSb2xlOnJlYWQiLCJSb2xlOnVwZGF0ZSIsIlJvbGU6ZGVsZXRlIiwiVGVhbU1lbWJlcjpjcmVhdGUiLCJUZWFtTWVtYmVyOnJlYWQiLCJUZWFtTWVtYmVyOnVwZGF0ZSIsIlRlYW1NZW1iZXI6ZGVsZXRlIiwiRXF1aXBtZW50OmNyZWF0ZSIsIkVxdWlwbWVudDpyZWFkIiwiRXF1aXBtZW50OnVwZGF0ZSIsIkVxdWlwbWVudDpkZWxldGUiLCJTY2hlZHVsZTpjcmVhdGUiLCJTY2hlZHVsZTpyZWFkIiwiU2NoZWR1bGU6dXBkYXRlIiwiU2NoZWR1bGU6ZGVsZXRlIl0sInJvbGVzIjpbeyJuYW1lIjoiQWRtaW4iLCJpZCI6IjU3YmM1ZTFjLTUwNTktNDU2Yy05ZmE1LTU3YTZkODlmYzAyMiJ9XSwibmFtZSI6IlJvc3MgTGVpdGNoIiwiZW1haWwiOiJwcm9mZXNzaW9uYWwuYmFsYmF0cm9zc0BnbWFpbC5jb20iLCJpYXQiOjE2MTU5MzgwODF9.cOILdsksY4G5q1Uwux0-1-Xw7NhvMBhCw39Zaqh2l44`


const SignupView : FC<SignupProps> = (props) => {

    let [ user, setUser ] = React.useState<UserInfo | null>()

    let [ err, setErr ] = React.useState<string>()

    React.useEffect(() => {
        let query_string = qs.parse(window.location.search, {ignoreQueryPrefix: true})

        let signup_info : UserInfo | null = query_string.token && typeof(query_string.token) == 'string' ? decode(query_string.token) : null;
        if(!isEqual(signup_info, user) && signup_info){
            console.log("Update user", {...signup_info})
            setUser({
                username: signup_info.username,
                name: signup_info.name,
                email: signup_info.email,
                phone_number: signup_info.phone_number
            })
        }
        
    }, [window.location.search])

    const signup = () => {
        let query_string = qs.parse(window.location.search, {ignoreQueryPrefix: true})
        let token : string | null = typeof(query_string.token) === 'string' ? query_string.token : null
        if(user && token){
            trySignup(user, token).then((r) => {
                if(r.token){
                    localStorage.setItem('token', r.token)
                    props.history.push('/dashboard')
                }else{
                    setErr(r.error)
                    console.log("Error", r)
                }
                console.log("Signup response", r)
            })
        }
    }

    return user != null ? (
                <>
                <Typography variant="subtitle1" style={{fontWeight: 'bold', color: 'teal'}}>Login Details</Typography>
                <TextField 
                    error={err == 'Username already taken'}
                    value={user.username}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            username: e.target.value
                        })
                    }}
                    margin="dense" 
                    label="Username" />

                <TextField 
                    value={user.password}
                    error={Boolean(user.confirm_password && user.confirm_password != user.password)}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            password: e.target.value
                        })
                    }}
                    margin="dense" 
                    label="Password" 
                    type="password" />

                <TextField 
                    error={Boolean(user.confirm_password && user.confirm_password != user.password)}
                    value={user.confirm_password}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            confirm_password: e.target.value
                        })
                    }}
                    margin="dense"
                    label="Confirm Password"
                    type="password" />

                <Divider style={{marginTop: 8, marginBottom: 8}} />

                <Typography variant="subtitle1" style={{fontWeight: 'bold', color: 'teal'}}>Contact Details</Typography>
                <TextField 
                    onChange={(e) => {
                        setUser({
                            ...user,
                            name: e.target.value
                        })
                    }}
                    margin="dense" 
                    label="Name" 
                    value={user.name} />
                <TextField 
                    onChange={(e) => {
                        setUser({
                            ...user,
                            email: e.target.value
                        })
                    }}
                    margin="dense" 
                    label="E-mail" 
                    value={user.email}/>
                <TextField 
                    value={user.phone_number}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            phone_number: e.target.value
                        })
                    }}
                    margin="dense" 
                    label="Phone Number" />

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <Button onClick={signup} color="primary" variant="contained">
                        Signup
                    </Button>
                </div>
                </>
                ) : (
                    <div>
                        Invalid signup token, please ask your system administrator to send another invite
                    </div>
                )
}

export const Signup = withRouter(SignupView)