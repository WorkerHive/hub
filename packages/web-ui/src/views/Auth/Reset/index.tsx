import React, { useEffect, useState } from "react"
import qs from 'qs';
import decode from 'jwt-decode'
import { UserInfo } from "../Signup";
import { Button, TextField } from "@material-ui/core";
import { resetPassword } from "web-ui/src/actions/auth";

export const Reset = (props : any) => {

    const [ password, setPassword ] = useState<string>('');
    const [ confirm, setConfirm ] = useState<string>('');

    const [ error, setError ] = useState<boolean>(false);

    useEffect(() => {
        let query_string = qs.parse(window.location.search, {ignoreQueryPrefix: true})
        let signup_info : UserInfo | null = query_string.token && typeof(query_string.token) == 'string' ? decode(query_string.token) : null;

        console.log(signup_info)
    }, [window.location.search])

    const updateUser = () => {
        let query_string = qs.parse(window.location.search, {ignoreQueryPrefix: true})
        if(password === confirm && query_string.token && typeof(query_string.token) === 'string'){
            resetPassword(password, query_string.token).then((r) => {
                if(r.error){
                    setError(Boolean(r.error))
                }else{
                    localStorage.setItem('token', r.token);
                    props.history.push('/dashboard')
                }
            })
        }else{
            setError(true)
        }
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <TextField 
                type="password"
                error={error}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="New Password" 
                margin="dense" />
            <TextField 
                type="password"
                error={error}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                label="Confirm Password" 
                margin="dense"/>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button onClick={updateUser} color="primary" variant="contained">
                    Reset Password
                </Button>
            </div>
        </div>
    )
}