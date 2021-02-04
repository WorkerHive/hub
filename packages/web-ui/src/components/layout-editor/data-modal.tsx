import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { useHub } from '@workerhive/client';
import React from 'react';

const WorkUIProps = require('@workerhive/react-ui/dist/prop-spec.js')

export interface DataModalProps {
    open: boolean;
    onClose?(event?: any): any;
    component?: {componentName: string}
}

export interface DataModalInputProps {
    type: {type: string, properties: any};
    label?: string;
}

export const DataModalInput : React.FC<DataModalInputProps> = (props) => {
    const [ client, isReady, err ] = useHub()

    switch(props.type.type){
        case 'string':
            return <TextField fullWidth label={props.label} />
        case 'array':
            return (
                <FormControl fullWidth>
                    <InputLabel>{props.label}</InputLabel>
                    <Select fullWidth>
                        {client && client.models!.map((x : any) => (
                            <MenuItem>{x.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )
        case 'object':
            if(props.type.properties.args != null){
               return <div>Function ({Object.keys(props.type.properties.args.properties).join(', ')})</div>
            }
           return null;

        default: 
            return null;
    }
}

export const DataModal : React.FC<DataModalProps> = (props) => {
    const [ properties, setProperties ] = React.useState<any>({})

    React.useEffect(() => {
        if(props.component){
            let prop = WorkUIProps[`${props.component?.componentName}Props`]
            console.log(prop)
            setProperties(prop.properties)
        } 
    }, [props.component])


    return (
        <Dialog fullWidth open={props.open} onClose={props.onClose}>
            <DialogTitle>Link Data</DialogTitle>
            <DialogContent>
                {Object.keys(properties).map((prop: any) => {
                    return (
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <div style={{flex: 1}}>{prop} :</div> 
                         <div style={{flex: 1}}>
                             <DataModalInput label={prop} type={properties[prop]} />
                          </div>
                     </div>
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}