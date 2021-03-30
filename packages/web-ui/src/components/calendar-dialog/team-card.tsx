import React from 'react';
import { List, ListItem, Checkbox, Divider, Table, TableHead, TableCell, TableRow, TableBody } from '@material-ui/core';

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

    const sortFn = (a : TeamMember, b: TeamMember) => {
        if(a.name > b.name) return 1;
        if(b.name > a.name) return -1;
        return 0;
    }

    return (
        <Table>
            <TableHead style={{height: 30, backgroundColor: '#0d7272'}}>
                <TableRow style={{height: 30}}>
                    <TableCell padding="checkbox">
                        <Checkbox style={{color: '#fff'}} color="secondary"></Checkbox>
                    </TableCell>
                    <TableCell padding='none'>
                        Name
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {props.team.sort(sortFn).map((x, ix) => [
                <TableRow key={ix} style={{borderBottom: '2px solid #dfd', height: 30}}>
                    <TableCell padding="checkbox">
<Checkbox
                        color="primary"
                        disabled={props.readonly}
                        checked={props.selected.indexOf(x.id) > -1}
                        onChange={(e) => onChange(e, x)} />
                    </TableCell>
                    <TableCell style={{color: '#000'}} padding="none">
                    {x.name}

                    </TableCell>
                </TableRow>
            ])}
            </TableBody>

        </Table>
    )
}

export default TeamCard;