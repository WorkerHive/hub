import { Button, List, ListItem, Paper } from '@material-ui/core';
import { MutableDialog } from '@workerhive/react-ui';
import React from 'react';

import './index.css';

export interface MenuViewProps{
    children?: any;
    items: Array<any>;
    title: string;
    structure: any;
    onSave: (args: {item: object}) => void;
    onClick: (item: any) => void;
}

export function MenuView(props: MenuViewProps){

    const [ dialogOpen, openDialog ] = React.useState<boolean>(false);

    return (
        <div className="menu-view">
            {/*<MutableDialog title={props.title} structure={props.structure} onSave={props.onSave} onClose={() => openDialog(false)} open={dialogOpen} />*/}
            <Paper className="menu-view__menu">
                <List style={{flex: 1}}>
                    {props.items.map((x) => (
                        <ListItem button onClick={() => props.onClick({item: x})}>{x.name}</ListItem>
                    ))}
                </List>
                <div className="menu-view__action">
                    <Button onClick={() => openDialog(true)} color="primary" variant="contained">Add</Button>
                </div>
            </Paper>
            <div className="menu-view__inner">
                {props.children}
            </div>
        </div>
    )
}