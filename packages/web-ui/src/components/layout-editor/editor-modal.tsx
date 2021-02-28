import * as Components from '@workerhive/react-ui'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import * as React from 'react';

const WorkUIProps : any = {} // require('@workerhive/react-ui/dist/prop-spec.js')

const WorkUI : any = {...Components}



export interface EditorModalProps{
    open: boolean;
    onClose?: (e: any) => void;
    onSave?: (e: any, componentName: string) => void;
}

export const EditorModal : React.FC<EditorModalProps> = (props) => {
    const [ component, setComponent ] = React.useState<any>(null);
    const [ componentProps, setComponentProps ] = React.useState<any>({});

    const onClose = (e: any) => {
        if(props.onClose) props.onClose(e);
        setComponent(null)
    }

    const onSave = (e: any) => {
        if(props.onSave) props.onSave(WorkUI[component], component)
        onClose(e);
    }

    return (
        <Dialog fullWidth open={props.open} onClose={props.onClose}>
            <DialogTitle>Add component</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <FormControl>
                    <InputLabel>Component</InputLabel>
                    <Select value={component} onChange={(e) => {
                        setComponentProps(WorkUIProps[`${e.target.value}Props`].properties)
                        
                        setComponent(e.target.value)
                    }}>
                        {Object.keys(WorkUI).map((x : string) => (
                            <MenuItem value={x}>{x}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <div>
                    {Object.keys(componentProps).map((x) => {

                        return (
                            <div>
                               {x}: {componentProps[x].type}
                            </div>
                        )
                    })}
                </div>
                
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} >Cancel</Button>
                <Button onClick={onSave} color="primary" variant="contained">Add</Button>
            </DialogActions>
        </Dialog>
    )
}