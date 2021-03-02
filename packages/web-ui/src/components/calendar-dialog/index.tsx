import { Typography, Collapse, Accordion, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Paper } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import { isEqual } from 'lodash';
import React from 'react';
import { TeamCircles } from '@workerhive/react-ui';

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
}

export const CalendarDialog : React.FC<CalendarDialogProps> = ({
    data = {}, 
    onClose = () => {}, 
    onSave = () => {},
    open,
    projects,
    team
}) => {

    const [tOpen, setTOpen] = React.useState(false)
    const [eOpen, setEOpen] = React.useState(false)

    const [ _data, setData ] = React.useState<any>(data)

    React.useEffect(() => {
        if(!isEqual(_data, data)){
            setData(data)
        }
    }, [data])
    console.log(data, _data);

    return (
        <Dialog fullWidth open={open} onClose={onClose}>
            <DialogTitle style={{display: 'flex', flexDirection: 'column'}}>
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
            <DialogContent>
               
               
                <TextField 
                    label="Description"
                    multiline
                    fullWidth
                    rows={4}
                    rowsMax={7} />
                <Paper style={{
                    flexDirection: 'column',
                    background: 'darkgray', 
                    color: 'white', 
                    display: 'flex', 
                    marginTop: 4, 
                    padding: 4,
                    cursor: 'pointer'
                }} >
                    <div onClick={() => setTOpen(!tOpen)} style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
                   
                    <div style={{display: 'flex'}}>
                        {tOpen ? <ExpandMore /> : <ChevronRight />}  <Typography variant="subtitle1">Team</Typography>
                    </div>
                  
                    <TeamCircles 
                        options={team}
                        onChange={(members : any) => {
                          setData({
                            ..._data,
                            people: members
                          })
                          console.log(members)
                        }}
                        members={_data.people}/>
                    </div>
                    
                    <Collapse in={tOpen}>
                        <div>E</div>
                    </Collapse>
                </Paper>
                <Paper style={{
                    flexDirection: 'column',
                    background: 'darkgray', 
                    color: 'white', 
                    display: 'flex', 
                    marginTop: 4, 
                    padding: 4,
                    cursor: 'pointer'
                }} >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }} onClick={() => setEOpen(!eOpen)}>
                   <div style={{display: 'flex'}}>
                   {eOpen ? <ExpandMore /> : <ChevronRight />}<Typography variant="subtitle1">Equipment</Typography>
                    </div> 

                    </div>
                    <Collapse in={eOpen}>
                        <div>T</div>
                    </Collapse>
                </Paper>
                
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
