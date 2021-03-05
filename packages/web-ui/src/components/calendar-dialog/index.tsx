import { Divider, Tabs, Tab, Typography, Collapse, Accordion, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Paper } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker } from '@material-ui/pickers';

import { isEqual } from 'lodash';
import React from 'react';
import {InfoCard} from './info-card';
import {EquipmentCard} from './equipment-card'
import {TeamCard} from './team-card';

export interface CalendarDialogProps {
    open: boolean;
    onClose: any | undefined;
    onSave: any | undefined;
    data: {
        project?: {id: string},
        people?: {id: Array<string>},
        resources?: {id: Array<string>},
        start?: Date,
        end?: Date
    } | undefined;
    projects: Array<{id: string, name: string}>;
    team: Array<{id: string, name: string}>;
    equipment: Array<{id: string, name: string}>;
}

export const CalendarDialog : React.FC<CalendarDialogProps> = ({
    data = {}, 
    onClose = () => {}, 
    onSave = () => {},
    open,
    projects,
    equipment,
    team
}) => {

    const [tab, setTab] = React.useState<number>(0)

    const [ _data, setData ] = React.useState<any>(data)

    React.useEffect(() => {
        if(!isEqual(_data, data)){
            setData(data)
        }
    }, [data])

    const tabs = ["Team", "Equipment", "Notes"]
    const renderTab = () => {
        let t = tabs[tab] || '';
        switch(t.toLowerCase()){
            case 'notes':
                return <InfoCard />
            case 'equipment':
                return <EquipmentCard equipment={equipment} selected={_data?.resources?.id || _data?.resources?.map((x : any) => x.id) || []} onChange={(equipment: any) => {
                    setData({
                        ..._data,
                        resources: {id: equipment}
                    })  
                }}/>
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
            <Autocomplete 
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
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={() => onSave(_data)} color="primary" variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
