import { TextField, Typography } from '@material-ui/core';
import React from 'react';

export const InfoCard = (props : any) => {
    return (
<>
        <TextField 
        fullWidth
        label="Description"
        multiline
        rows={6}
        rowsMax={8} />
 
    <div style={{marginTop: 4, display: 'flex', flexDirection: 'column'}}>
        <Typography variant="subtitle1" style={{fontWeight: 'bold'}}>Activity</Typography>
        <TextField label="Write a comment" fullWidth multiline />
    </div>
    </>
    )
}