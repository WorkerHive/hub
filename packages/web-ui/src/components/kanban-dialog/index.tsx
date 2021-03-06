import React from 'react';

import { Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField } from '@material-ui/core';


export default function KanbanDialog(props : any){
    return (
        <Dialog 
            fullWidth
            open={props.open}>
            <DialogTitle>
                <TextField fullWidth label="Title" />
            </DialogTitle>
            <DialogContent style={{display: 'flex'}}>
                <div style={{flex: 0.8, display: 'flex', flexDirection: 'column'}}>
                    <TextField rows={3} rowsMax={6} fullWidth multiline label="Description" />
                </div>
                <div style={{flex: 0.2, display: 'flex', flexDirection: 'column'}}>
                    <Button variant="contained">Members</Button>
                </div>
            </DialogContent>
            <DialogActions>
                <Button>Cancel</Button>
                <Button color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}