import { Button, Divider, Paper, TextField, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import decode from 'jwt-decode';
import qs from 'qs';
import { isEqual } from 'lodash';
import './index.css';
import { Link, withRouter } from 'react-router-dom';
import SyncLoader from 'react-spinners/SyncLoader';
import { useHub, UserInfo } from '@workerhive/client';

export interface SignupProps {
    history?: any;
}


const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicGVybWlzc2lvbnMiOlsiV29ya2Zsb3c6Y3JlYXRlIiwiV29ya2Zsb3c6cmVhZCIsIldvcmtmbG93OnVwZGF0ZSIsIldvcmtmbG93OmRlbGV0ZSIsIkNvbnRhY3RPcmdhbmlzYXRpb246Y3JlYXRlIiwiQ29udGFjdE9yZ2FuaXNhdGlvbjpyZWFkIiwiQ29udGFjdE9yZ2FuaXNhdGlvbjp1cGRhdGUiLCJDb250YWN0T3JnYW5pc2F0aW9uOmRlbGV0ZSIsIktub3dsZWRnZTpjcmVhdGUiLCJLbm93bGVkZ2U6cmVhZCIsIktub3dsZWRnZTp1cGRhdGUiLCJLbm93bGVkZ2U6ZGVsZXRlIiwiUHJvamVjdDpjcmVhdGUiLCJQcm9qZWN0OnJlYWQiLCJQcm9qZWN0OnVwZGF0ZSIsIlByb2plY3Q6ZGVsZXRlIiwiUm9sZTpjcmVhdGUiLCJSb2xlOnJlYWQiLCJSb2xlOnVwZGF0ZSIsIlJvbGU6ZGVsZXRlIiwiVGVhbU1lbWJlcjpjcmVhdGUiLCJUZWFtTWVtYmVyOnJlYWQiLCJUZWFtTWVtYmVyOnVwZGF0ZSIsIlRlYW1NZW1iZXI6ZGVsZXRlIiwiRXF1aXBtZW50OmNyZWF0ZSIsIkVxdWlwbWVudDpyZWFkIiwiRXF1aXBtZW50OnVwZGF0ZSIsIkVxdWlwbWVudDpkZWxldGUiLCJTY2hlZHVsZTpjcmVhdGUiLCJTY2hlZHVsZTpyZWFkIiwiU2NoZWR1bGU6dXBkYXRlIiwiU2NoZWR1bGU6ZGVsZXRlIl0sInJvbGVzIjpbeyJuYW1lIjoiQWRtaW4iLCJpZCI6IjU3YmM1ZTFjLTUwNTktNDU2Yy05ZmE1LTU3YTZkODlmYzAyMiJ9XSwibmFtZSI6IlJvc3MgTGVpdGNoIiwiZW1haWwiOiJwcm9mZXNzaW9uYWwuYmFsYmF0cm9zc0BnbWFpbC5jb20iLCJpYXQiOjE2MTU5MzgwODF9.cOILdsksY4G5q1Uwux0-1-Xw7NhvMBhCw39Zaqh2l44`


const SignupView: FC<SignupProps> = (props) => {

    const [ client ] = useHub();

    let [token, setToken] = React.useState<string>('');
    let [user, setUser] = React.useState<UserInfo | null>()

    let [ prefill, setPrefill ] = React.useState<UserInfo>();

    const [loading, setLoading] = React.useState<boolean>(true);

    let [userErr, setUserErr] = React.useState<string>();
    let [err, setErr] = React.useState<string>()

    React.useEffect(() => {
        let query_string = qs.parse(window.location.search, { ignoreQueryPrefix: true })

        if (query_string.token && typeof (query_string.token) == 'string') {
            if (token != query_string.token) {
                setToken(query_string.token);
                client?.auth.signupInfo(query_string.token).then((info) => {
                    setLoading(false)
                    if (info.error) {
                        setUserErr(info.error)
                    } else if (info.signup_info) {
                        console.log(info)
                        setPrefill({
                            ...info.signup_info
                        })
                        setUser({
                            ...info.signup_info
                        })
                    }
                })
            }
        }
    }, [window.location.search])

    const signup = () => {
        let query_string = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        let token: string | null = typeof (query_string.token) === 'string' ? query_string.token : null
        if(!(user?.password && user?.confirm_password)){
            return setErr("No passwords")
        }  
        if (user && token) {
            client?.auth.trySignup(user, token).then((r) => {
                if (r.token) {
                    localStorage.setItem('token', r.token)
                    props.history.push('/dashboard')
                } else {
                    setErr(r.error)
                    console.log("Error", r)
                }
                console.log("Signup response", r)
            })
        }
    }

    if (user != null && !userErr) {
        return (
            <>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: 'teal' }}>Login Details</Typography>
                <TextField
                    disabled={Boolean(prefill?.username)}
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
                    error={err == "No passwords" || Boolean(user.confirm_password && user.confirm_password != user.password)}
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
                    error={err == "No passwords" || Boolean(user.confirm_password && user.confirm_password != user.password)}
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

                <Divider style={{ marginTop: 8, marginBottom: 8 }} />

                <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: 'teal' }}>Contact Details</Typography>
                <TextField
                    disabled={Boolean(prefill?.name)}
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
                    disabled={Boolean(prefill?.email)}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            email: e.target.value
                        })
                    }}
                    margin="dense"
                    label="E-mail"
                    value={user.email} />
                <TextField
                    disabled={Boolean(prefill?.phone_number)}
                    value={user.phone_number}
                    onChange={(e) => {
                        setUser({
                            ...user,
                            phone_number: e.target.value
                        })
                    }}
                    margin="dense"
                    label="Phone Number" />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <Button onClick={signup} color="primary" variant="contained">
                        Signup
                    </Button>
                </div>
            </>
        )
    } else if (userErr) {
        return (
            <div style={{ marginTop: 8 }}>
                Signup Error: {userErr}
                <Divider style={{ marginTop: 12, marginBottom: 12 }} />
                <Link to="/">Login</Link>
            </div>
        )
    } else if (loading) {
        return (
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
             <SyncLoader color='#079692' loading size={30} />
             <Typography variant="subtitle1">Loading</Typography>
            </div>
           

        )
    } else {
        return (<div style={{ marginTop: 8 }}>
            Invalid signup token, please ask your system administrator to send another invite
        </div>)
    }
}

export const Signup = withRouter(SignupView)