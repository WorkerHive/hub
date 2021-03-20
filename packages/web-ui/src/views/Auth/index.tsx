import { Divider, Paper, Typography } from '@material-ui/core';
import React from 'react'
import { Switch, Route } from 'react-router-dom';

import { Login } from './Login'
import { Reset } from './Reset';
import { Signup } from './Signup';
import { Forgot } from './Forgot';

import './index.css';
export const AuthBase = (props: any) => {
    return (
        <div className="auth-base">
            <div className="auth-img">

            </div>
            <Paper className="auth-content">
                <div className="auth-header">
                    <img src={'/assets/teal.png'} className="auth-header__img" alt="Workhub Logo" />
                    <Typography style={{ color: 'teal' }} variant="h5">{props.title || 'Workhub'}</Typography>
                </div>
                          
                <Divider />
                <Switch>
                    <Route path="/" component={Login} exact />
                    <Route path="/signup" component={Signup} />
                    <Route path="/login" component={Login} />
                    <Route path="/forgot" component={Forgot} />
                    <Route path="/reset" component={Reset} />
                </Switch>
            </Paper>
        </div>
    )
}