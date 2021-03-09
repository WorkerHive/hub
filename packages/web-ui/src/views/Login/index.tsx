import { Divider, Button, Paper, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { authenticate, forgotPassword } from '../../actions/auth'
import { Link } from 'react-router-dom';
import SyncLoader from 'react-spinners/SyncLoader'
import './index.css';

export interface LoginProps{
    title: string;
    history: any;
}

export const Login = (props : LoginProps) => {

    const [ loginError, setLoginError] = React.useState<boolean>(false)
    const [ loading, setLoading ] =  React.useState<boolean>(false)

    const [ forgotError, setForgotError] = React.useState<boolean>(false)
    
    const [ forgot, setForgot ] = React.useState<boolean>(false);

    const [ email, setEmail ] = React.useState<string>('')

    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');

    const login = () => {
        setLoading(true)
        setLoginError(false);
        authenticate(username, password).then((data: any) => {
            setLoading(false)
            if(data.token){
                localStorage.setItem('token', data.token) //Change this to reducer
                props.history.push(`/dashboard`)
            }else{
                setLoginError(Boolean(data.error))
                console.log(data.error)
            }
           
        })
       
    }

    return (
        <div className="login-view">
           <div className="image-section">
            </div> 
            <Paper className="login-section">
                <div className="login-header">
                    <img src={'/assets/teal.png'} className="login-header__img" alt="Workhub Logo"/>
                    <Typography style={{color: 'teal'}} variant="h5">{props.title || 'Workhub'}</Typography>
                </div>
                <Divider />
                {forgot ? (
                    <>
                        <TextField 
                            error={forgotError}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                            label="Email" />
                        <Button 
                            onClick={() => {
                                forgotPassword(email).then((r : any) => {
                                    if(r.error){
                                        setForgotError(true)
                                    }else{
                                        setForgotError(false)
                                        setForgot(false)
                                    }
                                })
                            }}
                            style={{marginTop: 8}} 
                            color="primary" 
                            variant="contained">{loading ? <SyncLoader color={'#079692'} size={10} loading /> : "Submit"}</Button>
                    </>
                ) : (
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
                        if(e.which === 13 || e.keyCode === 13){
                            login();
                        }
                    }}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    label="Password" />
                <Button 
                    onClick={login}
                    style={{marginTop: 8}}
                    color="primary"
                    variant="contained">Login</Button>
                    </>)}
                
                <Divider style={{marginTop: 8, marginBottom: 8}} />

                <div style={{display: 'flex', justifyContent: 'center', cursor: 'pointer'}} onClick={() => {
                    setForgot(!forgot)
                }} >
                    {!forgot ? "Forgot Password" : "Go to Login" }
                </div>

            </Paper>
        </div>
    )
}