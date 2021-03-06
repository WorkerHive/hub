import React from 'react';
import {Button, IconButton, TextField} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';

export interface NotesCardProps {
    notes?: Array<string>;
    onChange?: (notes: Array<string>) => void;
}
const NotesCard : React.FC<NotesCardProps> = ({
    notes = [],
    onChange = () => {}
}) => {

    const [selected, setSelected] = React.useState<number>(-1);

    const addNote = () => {
        let n = notes.slice()
        n.push('')
        onChange(n)
        setSelected(n.length -1 )
    }

    const removeNote = (ix: number) => {
        let n = notes.slice()
        n.splice(ix, 1);
        onChange(n)
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            {notes.map((note, ix) => {
                return (
                <div key={ix} style={{display: 'flex'}}>
                <TextField 
                    focused={ix == selected}
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
                    <Clear />
                </IconButton>
                </div>)
            })}
            <Button onClick={addNote}>Add note</Button>
        </div>
    );
}
export default NotesCard;