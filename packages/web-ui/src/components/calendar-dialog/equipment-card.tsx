import React from 'react';
import { List, ListItem, Checkbox, Divider } from '@material-ui/core';

export interface EquipmentCardProps {
    equipment: Array<{id: string, name: string}>;
    selected: Array<any>;
    onChange: any;
    readonly?: boolean;
}

const EquipmentCard : React.FC<EquipmentCardProps> = (props) => {
    console.log("equipment", props.equipment, props.selected)
    return (
        <List style={{overflowY: 'auto', minHeight: 300}}>
            {props.equipment.map((x, ix) => [
                <ListItem key={ix} dense>
                    <Checkbox 
                        color="primary"
                        disabled={props.readonly} 
                        checked={props.selected.indexOf(x.id) > -1} 
                        onChange={(e) => {
                        let ix = props.selected.indexOf(x.id);
                        let s = props.selected.slice();
                        if(!e.target.checked){
                            s.splice(ix, 1)
                        }else{
                            s.push(x.id)
                        }
                        props.onChange(s)
                    }} />
                    {x.name}
                </ListItem>,
                <Divider />
            ])}
        </List>
    )
}

export default EquipmentCard;