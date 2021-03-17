import { Divider, Tabs, Tab, IconButton, Typography, Collapse, Accordion, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Paper } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { isEqual } from 'lodash';
import React, {lazy, Suspense} from 'react';

import NotesCard from './notes-card';
import InfoCard from './info-card';
import EquipmentCard from './equipment-card'
import TeamCard from './team-card';
import { ExitToApp } from '@material-ui/icons';


export interface CalendarDialogProps extends RouteComponentProps{
    actions?: string[];
    open?: boolean;
    onClose?: any | undefined;
    onSave?: any | undefined;
    onDelete?: any;
    data?: {
        project?: {id: string},
        people?: {id: Array<string>},
        resources?: {id: Array<string>},
        notes?: Array<string>,
        description?: string,
        start?: Date,
        end?: Date
    } | undefined;
    projects?: Array<{id: string, name: string}>;
    team?: Array<{id: string, name: string}>;
    equipment?: Array<{id: string, name: string}>;
}

export const CalendarDialog : React.FC<CalendarDialogProps> = ({
    data = {}, 
    onClose = () => {}, 
    onSave = () => {},
    onDelete = () => {},
    open = false,
    projects = [],
    equipment = [],
    actions = ["create", "read", "update", "delete"],
    team = [],
    history
}) => {

    const [tab, setTab] = React.useState<number>(1)

    const [ _data, setData ] = React.useState<any>(data)

    React.useEffect(() => {
        if(!isEqual(_data, data)){
            setData(data)
        }
    }, [data])

    const tabs = ["Info", "Team", "Equipment", "Notes"]
    const renderTab = () => {
        let t = tabs[tab] || '';
        switch(t.toLowerCase()){
            case 'notes':
                return (
                <NotesCard 
                    notes={_data?.notes}
                    onChange={(notes) => {
                        setData({
                            ..._data,
                            notes: notes
                        })   
                    }}/>
                )
            case 'info':
                return (
                <InfoCard 
                    description={_data?.description} 
                    onChange={(description) => {
                    setData({
                        ..._data,
                        description: description
                    })
                   }}/>)
            case 'equipment':
                return (<EquipmentCard 
                    equipment={equipment} 
                    selected={_data?.resources?.id || _data?.resources?.map((x : any) => x.id) || []} 
                    onChange={(equipment: any) => {
                        setData({
                            ..._data,
                            resources: {id: equipment}
                        })  
                    }}/>)
            case 'team':
                return <TeamCard team={team} selected={_data?.people?.id || _data?.people?.map((x : any) => x.id) || []} onChange={(people : any) => {
                    setData({
                        ..._data,
                        people: {id: people}
                    })  
                }}/>
            default:
                return null;
        }
    }

    return (
        <Dialog fullWidth open={open} onClose={onClose}>
            <DialogTitle style={{
                paddingBottom: 8,
                paddingTop: 12,
                borderBottom: '1px solid #dfdfdf',
                display: 'flex', 
                flexDirection: 'column'}}>
                    <div style={{display: 'flex', alignItems: 'flex-end'}}>
                        <Autocomplete 
                        fullWidth
                        value={projects.find((a : any) => a.id == _data.project?.id)}
                        onChange={(event, newVal) => {
                            setData({
                                ..._data,
                                project: newVal ? {id: newVal?.id} : null
                            })
                        }}
                        options={projects}
                        getOptionLabel={(option) => option.name || ''}
                        renderInput={(params) => <TextField {...params} label="Project"  /> }/>
                        {_data.project && _data.project.id && <IconButton onClick={() => {
                            history.push(`/dashboard/projects/${_data.project?.id}`)
                        }} size="small">
                            <ExitToApp />
                        </IconButton>}
                    </div>
      
                <div style={{display: 'flex', marginTop: 8, marginRight: '30%'}}>
                    <KeyboardDatePicker 
                        margin="dense"
                        fullWidth
                        label="Start"
                        format={"DD/MM/YYYY"}
                        value={_data.start} 
                        onChange={(date) => {
                            let d = date?.valueOf()
                            setData({
                                ..._data,
                                start: d ? new Date(d) : _data.start
                            })
                        }}/>
                    <KeyboardDatePicker 
                        fullWidth
                        margin="dense"
                        label="End"
                        format={"DD/MM/YYYY"}
                        value={_data.end} 
                        onChange={(date) => {
                            let d = date?.valueOf()
                            setData({
                                ..._data,
                                end: d ? new Date(d) : _data.end
                            })
                        }}/>
                </div>
            </DialogTitle>
            <DialogContent style={{paddingLeft: 0, display: 'flex'}}>
               
               <Tabs
                onChange={(event, newValue) => {
                    console.log(newValue)
                    setTab(newValue)
                }}
                value={tab}
                orientation="vertical"
                style={{borderRight: '1px solid #dfdfdf', display: 'flex', marginRight: 8}}
                >
                    {tabs.map((x : any, ix) => [
                        <Tab label={x} value={ix} />,
                        <Divider />
                    ])}
        
               </Tabs>
               <div style={{minHeight: '37vh', maxHeight: '50vh', flex: 1, display: 'flex', flexDirection: 'column'}}>
                        {renderTab()}
               </div>
  
            </DialogContent>
            <DialogActions>
                {actions.indexOf('delete') > -1 && <Button onClick={onDelete} color="secondary">Delete</Button>}
                <Button onClick={onClose}>
                    Close
                </Button>
                {actions.indexOf('update') > -1 || actions.indexOf('create') > -1 && <Button onClick={() => onSave(_data)} color="primary" variant="contained">
                    Save
                </Button>}
            </DialogActions>
        </Dialog>
    )
}

export default withRouter(CalendarDialog)
