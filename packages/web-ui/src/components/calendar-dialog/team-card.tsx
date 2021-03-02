import React from 'react';
import { List, ListItem, Checkbox, Divider } from '@material-ui/core';

export interface TeamCardProps {
    onChange: any;
    selected: Array<any>;
    team: Array<{id: string, name: string}>;

}

export const TeamCard : React.FC<TeamCardProps> = (props) => {
    return (
        <List style={{overflowY: 'auto'}}>
            {props.team.map((x) => [
                <ListItem dense>
                    <Checkbox checked={props.selected.indexOf(x.id) > -1} onChange={(e) => {
                        let ix = props.selected.indexOf(x.id) 
                        let s = props.selected.slice();
                        if(!e.target.checked){
                            s.splice(ix, 1)
                        }else{
                            s.push(x.id)
                        }
                        console.log(e.target.checked, s)
                        props.onChange(s)
                    }}/>
                    {x.name}
                </ListItem>,
                <Divider />
            ])}
        </List>
    )
}