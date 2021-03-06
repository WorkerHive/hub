import { Divider, Tabs, Tab, IconButton, Typography, Collapse, Accordion, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Paper } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { isEqual } from 'lodash';
import React, {lazy, Suspense} from 'react';
import { SelectTable, TabView, TeamCircles } from '@workerhive/react-ui'
import *  as Y from 'yjs';

import NotesCard from './notes-card';
import InfoCard from './info-card';
import EquipmentCard from './equipment-card'
import TeamCard from './team-card';
import { ExitToApp, PersonAdd } from '@material-ui/icons';
import { useHub } from '@workerhive/client';
import {ReactComponent as PersonRemove} from './person_remove.svg';

import {ReactComponent as TeamIcon} from '../../assets/team2.svg';
import {ReactComponent as EquipmentIcon} from '../../assets/resources2.svg';
import {ReactComponent as NotesIcon} from '../../assets/comments-hex.svg';

export interface CalendarDialogProps extends RouteComponentProps{
    actions?: string[];
    slots?: {start: Date, end: Date};
    open?: boolean;
    onClose?: any | undefined;
    onSave?: any | undefined;
    onDelete?: any;
    data?: Y.Map<any>;
    projects?: Array<{id: string, name: string}>;
    team?: Array<{id: string, name: string}>;
    equipment?: Array<{id: string, name: string}>;
}

export interface CalendarItem {
        project?: {id: string},
        people?: {id: Array<string>},
        resources?: {id: Array<string>},
        notes?: Array<string>,
        description?: string,
        start?: Date,
        end?: Date
}

export interface Manager {
    id: string;
    name: string;
}

export const CalendarDialog : React.FC<CalendarDialogProps> = ({
    data = new Y.Map(), 
    slots,
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

    const [ client ] = useHub();
    const [tab, setTab] = React.useState<number>(0)

    const [ dateRange, setDateRange ] = React.useState<{start: Date, end: Date} | undefined>(slots)

    const [ _data, setData ] = React.useState<any>({})

    const [ managers, setManagers ] = React.useState<Manager[]>([])

    React.useEffect(() => {
        console.log(open, slots)
        if(open){
            console.log("Set data")
            let d = data?.toJSON();
            if(slots?.start && !d.start) d.start = slots?.start;
            if(slots?.end && !d.end) d.end = slots?.end;
            console.log(d)
            setData(d)
            setManagers(d.managers)
        }else{
            setData({})
            setManagers([])
        }
    }, [open])

    const amManager = (live: boolean = false) => {
        return (data?.toJSON().managers || []).map((x: any) => x.id).indexOf(client?.user.sub) > -1;
    }


    const _onClose = () => {
        setTab(0)

        onClose()
    }

    const tabSize = 50;
    const readonly = _data.id ? actions.indexOf('update') < 0 || !amManager() : false;

    const tabs = [
        {
            label: "Team",
            icon: <TeamIcon fill="#0d7272" height={tabSize}/>,
            view: (
                <SelectTable
                    data={team}
                    readonly={readonly}
                    selected={_data?.people?.id || _data?.people?.map((x: any) => x.id) || []}
                    onChange={(people: any) => {
                        setData({
                            ..._data,
                            people: {id: people}
                        })
                    }} />)
        },
        {
            label: "Equipment",
            icon: <EquipmentIcon fill="#0d7272" height={tabSize}/>,
            view: (
                 <SelectTable 
                    readonly={readonly}
                    data={equipment} 
                    selected={_data?.resources?.id || _data?.resources?.map((x : any) => x.id) || []} 
                    onChange={(equipment: any) => {
                        console.log(_data)
                        setData({
                            ..._data,
                            resources: {id: equipment}
                        })  
                    }}/>
            )
        },
        {
            label: "Notes",
            icon: <NotesIcon fill="#0d7272" height={tabSize}/>,
            view: (
                 <NotesCard
                    readonly={readonly}
                    notes={_data?.notes}
                    onChange={(notes) => {
                        console.log(notes, _data)
                         setData({
                            ..._data,
                            notes: notes
                        })
                    }}/>
            )
        }] 
    

    const renderTab = () => {
        let t = tabs[tab] || '';
        /*switch(t.label.toLowerCase()){
            case 'notes':
                return (
               
                )
            case 'info':
                return (
                <InfoCard 
                    readonly={readonly}
                    description={_data?.description} 
                    onChange={(description) => {
                        console.log(_data, description)
                    setData({
                        ..._data,
                        description: description
                    })
                   }}/>)
            case 'equipment':
                return (
               )
            case 'team':
                return 
            default:
                return null;
        }*/
    }



    const addSelfManager = () => {

        //TODO make manager list search through Team from ID key
        let m = (data?.toJSON().managers || []).slice();
        let ix = m.map((x : any) => x.id).indexOf(client?.user.sub)
        if(ix > -1){
            m.splice(ix, 1)
        }else{
            m.push({id: client?.user.sub, name: client?.user.name})
        }

        data?.set('managers', m)
        setManagers(data?.get('managers'))
        console.log("Set managers", m, data)
    }

    return (
        <Dialog fullWidth maxWidth="md" open={open}  onClose={_onClose}>
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
                        getOptionLabel={(option) => `${option.id} - ${option.name}` || ''}
                        renderInput={(params) => <TextField {...params} label="Project"  /> }/>
                        {_data.project && _data.project.id && <IconButton onClick={() => {
                            history.push(`/dashboard/projects/${_data.project?.id}`)
                        }} size="small">
                            <ExitToApp style={{fill: '#0d7272'}}/>
                        </IconButton>}
                    </div>
      
                <div style={{display: 'flex', marginTop: 8}}>
                    <KeyboardDatePicker 
                        margin="dense"
                        fullWidth
                        label="Start"
                        format={"DD/MM/YYYY"}
                        value={_data.start || slots?.start} 
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
                        value={_data.end || slots?.end} 
                        onChange={(date) => {
                            let d = date?.valueOf()
                            setData({
                                ..._data,
                                end: d ? new Date(d) : _data.end
                            })
                        }}/>
                    
                    <div className="manager-list" style={{color: 'white', minWidth: 100, maxWidth: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TeamCircles size={30} members={(_data.id ? managers : [{id: client?.user.sub, name: client?.user.name}]) || []} />
                        {client?.canAccess("Schedule", "update") && _data.id && <IconButton size="small" onClick={addSelfManager}>
                            {amManager() ? <PersonRemove fill="#0d7272" /> : <PersonAdd style={{fill:"#0d7272"}} />}
                        </IconButton>}
                    </div>
                </div>
            </DialogTitle>
            <DialogContent style={{paddingLeft: 0, display: 'flex', minHeight: 300}}>
               <TabView 
                    selected={tab}
                    onClick={(tab: any, index: number) => setTab(index)}
                    tabs={tabs} />
               {/*<Tabs
                onChange={(event, newValue) => {
                    console.log(newValue)
                    setTab(newValue)
                }}
                value={tab}
                orientation="vertical"
                style={{borderRight: '1px solid #dfdfdf', display: 'flex', marginRight: 8}}
                >
                    {tabs.map((x : any, ix) => [
                        <Tab 
                            icon={x.icon}
                            value={ix}>
                        </Tab>,
                        <Divider />
                    ])}
        
               </Tabs>
               <div style={{minHeight: '37vh', maxHeight: '50vh', flex: 1, display: 'flex', flexDirection: 'column'}}>
                        {renderTab()}
                </div>*/}
  
            </DialogContent>
            <DialogActions>
                {_data.id && actions.indexOf('delete') > -1 && amManager() && <Button style={{fontWeight: 'bold'}} onClick={onDelete} color="secondary">Delete</Button>}
                <Button onClick={_onClose}>
                    Close
                </Button>
                {(actions.indexOf('update') > -1 || actions.indexOf('create') > -1) && (!_data.id || (_data.id && amManager())) && <Button onClick={() => onSave(_data)} color="primary" variant="contained">
                    {_data.id ? "Save" : "Create"}
                </Button>}
            </DialogActions>
        </Dialog>
    )
}

export default withRouter(CalendarDialog)
