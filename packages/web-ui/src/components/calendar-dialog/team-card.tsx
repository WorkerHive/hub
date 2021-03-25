import React from 'react';
import { List, ListItem, Checkbox, Divider } from '@material-ui/core';

export interface TeamMember {
    id: string;
    name: string;
}

export interface TeamCardProps {
    onChange: any;
    selected: Array<any>;
    team: Array<TeamMember>;
    readonly?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = (props) => {

    const onChange = (e: React.ChangeEvent<HTMLInputElement>, item : TeamMember) => {
        let ix = props.selected.indexOf(item.id)
        let s = props.selected.slice();
        if (!e.target.checked) {
            s.splice(ix, 1)
        } else {
            s.push(item.id)
        }
        console.log(e.target.checked, s)
        props.onChange(s)
    }

    return (
        <List style={{ overflowY: 'auto' }}>
            {props.team.map((x, ix) => [
                <ListItem key={ix} dense>
                    <Checkbox
                        color="primary"
                        disabled={props.readonly}
                        checked={props.selected.indexOf(x.id) > -1}
                        onChange={(e) => onChange(e, x)} />
                    {x.name}
                </ListItem>,
                <Divider />
            ])}
        </List>
    )
}

export default TeamCard;