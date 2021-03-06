import React from 'react';
import {Button, IconButton, TextField} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';

export interface NotesCardProps {
    notes?: Array<string>;
    onChange?: (notes: Array<string>) => void;
    readonly?: boolean;
}
const NotesCard : React.FC<NotesCardProps> = ({
    notes = [],
    readonly = false,
    onChange = () => {}
}) => {

    const addNote = () => {
        let n = notes.slice()
        n.push('')
        onChange(n)
    }

    const removeNote = (ix: number) => {
        let n = notes.slice()
        n.splice(ix, 1);
        onChange(n)
    }

    return (
        <div style={{display: 'flex', minHeight: 300, color: '#0d7272', padding: 8, marginBottom: 8, flexDirection: 'column'}}>
            {(notes || []).map((note, ix) => {
                return (
                <div key={ix} style={{display: 'flex'}}>
                <TextField 
                    disabled={readonly}
                    autoFocus
                    fullWidth
                    value={note} 
                    onKeyDown={(e) => {
                        if(e.keyCode == 13){
                            addNote();
                        }
                    }}
                    onChange={(e) => {
                        let n = notes.slice()
                        n[ix] = e.target.value;
                        onChange(n)  
                    }}/>
                <IconButton onClick={() => removeNote(ix)}>
                    <Clear style={{color: '#f1682f'}} />
                </IconButton>
                </div>)
            })}
            <Button variant="contained" color="primary" onClick={addNote}>Add note</Button>
        </div>
    );
}
export default NotesCard;