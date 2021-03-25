import { Button, TextField, Typography } from '@material-ui/core';
import React from 'react';
import Logo from '../../../assets/teal.png'
import { setupHub } from '../../../actions/auth'
import './index.css';

export interface HubSetupProps {
    history?: any
}

export const HubSetup: React.FC<HubSetupProps> = (props) => {
    const [hubUrl, setHubURL] = React.useState('')
    const [moniker, setMoniker] = React.useState('office-screen')

    const [ err, setErr ] = React.useState(false)

    const trySetup = () => {
        setupHub(hubUrl, moniker).then((r) => {
            if(r.error){
                setErr(true)
            }else{
                localStorage.setItem('token', r.token)
                props.history.push('/dashboard')
            }
        })
    }

    return (
        <div className="hub-setup">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div className="hub-box">
                    <img src={Logo} style={{ filter: 'invert(1)' }} />
                    <Typography variant="h6">WorkHub Setup</Typography>
                </div>
                <div className="hub-form">
                    <TextField
                        onChange={(e) => setHubURL(e.target.value)}
                        label="Hub URL"
                        value={hubUrl}></TextField>
                    <TextField
                        onChange={(e) => setMoniker(e.target.value)}
                        label="Hub name"
                        value={moniker}></TextField>

                </div>

                <div style={{ marginTop: 12, display: 'flex', width: '36%', justifyContent: 'flex-end' }}>
                    <Button onClick={trySetup} color="primary" variant="contained">
                        Register
                    </Button>
                </div>
            </div>

        </div>
    )
}