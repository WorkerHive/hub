import { Fab, Menu, MenuItem, Typography } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Cancel from '@material-ui/icons/Cancel';
import Edit from '@material-ui/icons/Edit';

import React from 'react';
import { v4 } from 'uuid';
import { isEqual } from 'lodash'
import RGL, {WidthProvider} from 'react-grid-layout'
import { EditorModal } from './editor-modal';
import { DataModal } from './data-modal'
import 'react-grid-layout/css/styles.css';
import './index.css';

const ReactGridLayout = WidthProvider(RGL);

export interface LayoutEditorProps {
    onLayoutChange?: Function;
    layout?: any;
}

const defaultProps = {
    items: 20,
    rowHeight: 50,
    cols: 12, 
}
export const LayoutEditor : React.FC<LayoutEditorProps> = ({layout = [], onLayoutChange}) => {
    const [ context, setContext ] = React.useState<any>({})
    const [ modalOpen, openModal ] = React.useState<boolean>(false);
    const [ linkModal, openLink ] = React.useState<boolean>(false);

    const componentMenu = [<Edit />, <Cancel />]
    const setLayouts = (layout: any) => {
        if(onLayoutChange) onLayoutChange(layout)
    }

    const addItem = (Item: any, name: string) => {
        setLayouts(layout.concat([{
            i: v4(),
            x: 1,
            y: 1,
            w: 1,
            h: 1,
            component: <Item />,
            componentName: name
        }]))
    }


    const handleContextMenu = (event: React.MouseEvent, item: any) => {
        event.preventDefault();

        setContext({x: event.clientX - 2, y: event.clientY - 4, item: item})
        console.log("Right click menu", item)
    }

    return (
        <div className="workhub-layout-editor">
        <ReactGridLayout 
            style={{flex:1}}
            {...defaultProps}    
            layout={layout}
            onLayoutChange={(_layout : any) => {
                console.log("Layout change")
                let l = layout.map((x: any) => {
                    return {
                        ...x,
                        ..._layout.filter((a : any) => a.i == x.i)[0]
                    }
                })
                if(!isEqual(l, layout)){
                    setLayouts(l)
                }else{
                    console.log("No change")
                }
            }} 
            isBounded={true}>
                {layout.map((x: any) => (
                    <div onContextMenu={(e: React.MouseEvent) => {handleContextMenu(e, x)}} key={x.i} className="layout-item" style={{display: 'flex', flexDirection: 'column'}}>
                        <div className="component-menu">
                            {componentMenu}
                        </div>
                        {x.component}
                    </div>
                ))} 
        </ReactGridLayout>
        <Menu
            keepMounted
            open={context.y != null}
            onClose={() => setContext({})}
            anchorReference="anchorPosition"
            anchorPosition={
                context.y !== null && context.x !== null ? {
                    top: context.y, left: context.x
                } : undefined
            }
            >
                <Typography style={{fontWeight: 'bold', paddingLeft: 8}}>{context.item && context.item.componentName}</Typography>
                <MenuItem onClick={() => openLink(true)}>Link Data</MenuItem>
                <MenuItem style={{color: 'red'}}>Remove Component</MenuItem>
            </Menu>
        <Fab style={{position: 'absolute', right: 12, bottom: 12}} color="primary" onClick={() => openModal(true)}>
            <Add />
        </Fab>
        <DataModal component={context.item} open={linkModal} onClose={(e: any) => {openLink(false)}}/>
        <EditorModal open={modalOpen} onSave={(item, name) => {
            addItem(item, name)    
        }} onClose={() => openModal(false)}/>
        </div>
    )
}