import { TextField, Button, Divider } from '@material-ui/core';
import React from 'react';
import SyncLoader from 'react-spinners/SyncLoader'
import { Link } from 'react-router-dom';
import { useHub } from '@workerhive/client';

export const Forgot = (props: any) => {
    const [ client ] = useHub();


    const [forgotError, setForgotError] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false)

    const forgot = () => {
        client?.auth.forgotPassword(email).then((r: any) => {
            if (r.error) {
                setForgotError(true)
            } else {
                setForgotError(false)
                props.history.push('/')
            }
        })
    }

    return (
        <>
            <TextField
                error={forgotError}
                value={email}
                onKeyDown={(e) => {
                    if (e.code === "Enter") {
                        forgot();
                    }
                }}
                onChange={(e) => {
                    setEmail(e.target.value)
                }}
                label="Email" />
            <Button
                onClick={forgot}
                style={{ marginTop: 8 }}
                color="primary"
                variant="contained">{loading ? <SyncLoader color={'#079692'} size={10} loading /> : "Submit"}</Button>

            <Divider style={{ marginTop: 8, marginBottom: 8 }} />

            <Link to="/">
                Login
            </Link>
        </>
    )
}