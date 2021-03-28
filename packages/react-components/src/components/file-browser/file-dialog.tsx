import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import React from 'react';
import { FileDrop } from '../file-drop';


export interface FileDialogProps {
    onClose?: () => void;
    open: boolean;
}

export const FileDialog : React.FC<FileDialogProps> = (props) => {

    const onClose = () => {
        if(props.onClose) props.onClose();
    }

    return (
        <Dialog fullWidth open={props.open}>
            <DialogTitle>
                File Upload
            </DialogTitle>
            <DialogContent>
                <FileDrop onDrop={(files) => console.log(files)}>
                    {(isDragActive: boolean) => (
                        <div style={{height :200, border: '1px dashed black', borderRadius: 7}}>

                        <div>{isDragActive ? 'active' : 'inactive'}</div>
                        </div>

                    )}
                </FileDrop>
                
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button color="primary" variant="contained">Upload</Button>
            </DialogActions>
        </Dialog>
    )
}