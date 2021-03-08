import React from 'react';

import { Popover, Divider,Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField } from '@material-ui/core';
import { isEqual } from 'lodash';

export interface KanbanDialogData {
    id?: string,
    column?: string,
    title?: string,
    description?: string,
    members?: Array<string>
}
export interface KanbanDialogProps{
    open: boolean;
    data?: KanbanDialogData;
    onArchive?: Function;
    onClose?: Function;
    onSave?: (data: KanbanDialogData) => void;
}

const KanbanDialog: React.FC<KanbanDialogProps> = (props) => {
    
    const [ _data, setData ] = React.useState<KanbanDialogData | undefined>(props.data)

    React.useEffect(() => {
        if(!isEqual(_data, props.data)){
            setData(props.data)
        }
    }, [props.data])
    
    const [ anchorEl, setAnchorEl ] = React.useState(null);
    
    const showMembers = (e: any) => {
        setAnchorEl(anchorEl ? null : e.currentTarget)
    }

    const removeCard = () => {
        if(props.onArchive) props.onArchive();
    }

    const onClose = () => {
        if(props.onClose) props.onClose()
    }

    const onSave = () => {
        if(props.onSave && _data) props.onSave(_data);
    }

    return (
        <Dialog 
            onClose={onClose}
            fullWidth
            open={props.open}>
            <DialogTitle>
                <TextField 
                    value={_data?.title}
                    onChange={(e) => {
                        setData({
                            ..._data,
                            title: e.target.value
                        })
                    }}
                    fullWidth 
                    label="Title" />
            </DialogTitle>
            <DialogContent style={{display: 'flex'}}>
                <div style={{flex: 0.8, display: 'flex', flexDirection: 'column'}}>
                    <TextField 
                        value={_data?.description}
                        onChange={(e) => {
                            setData({
                                ..._data,
                                description: e.target.value
                            })
                        }}
                        rows={5} 
                        rowsMax={7} 
                        fullWidth 
                        multiline 
                        label="Description" />
                </div>
                <div style={{flex: 0.2, display: 'flex', flexDirection: 'column'}}>
                    <Button onClick={showMembers} variant="contained">Members</Button>
                    <Button style={{marginTop: 8}} onClick={removeCard} variant="contained" color="secondary" >Archive</Button>
                    <Popover
                        onClose={showMembers}
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            horizontal: 'left',
                            vertical: 'bottom'
                        }}>
                        <div style={{display: 'flex', flexDirection: 'column', padding: 4}}>
                            <TextField label="Search members" />
                            <Divider />
                        </div>
                    </Popover>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSave} color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}

export default KanbanDialog