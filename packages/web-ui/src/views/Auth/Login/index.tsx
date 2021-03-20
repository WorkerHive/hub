import { Divider, Button, Paper, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { authenticate, forgotPassword } from '../../../actions/auth'
import { Link } from 'react-router-dom';
import SyncLoader from 'react-spinners/SyncLoader'
import './index.css';

export interface LoginProps {
    title: string;
    history: any;
}

export const Login = (props: LoginProps) => {

    const [loginError, setLoginError] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(false)

    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');

    const login = () => {
        setLoading(true)
        setLoginError(false);
        authenticate(username, password).then((data: any) => {
            setLoading(false)
            if (data.token) {
                localStorage.setItem('token', data.token) //Change this to reducer
                props.history.push(`/dashboard`)
            } else {
                setLoginError(Boolean(data.error))
                console.log(data.error)
            }

        })

    }

    return (

        <>


            <TextField
                error={loginError}
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)} />
            <TextField
                error={loginError}
                value={password}
                onKeyDown={(e) => {
                    if (e.which === 13 || e.keyCode === 13) {
                        login();
                    }
                }}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                label="Password" />
            <Button
                onClick={login}
                style={{ marginTop: 8 }}
                color="primary"
                variant="contained">Login</Button>

            <Divider style={{ marginTop: 8, marginBottom: 8 }} />

            <Link to="/forgot">
                Forgot Password?
            </Link>
        </>

    )
}