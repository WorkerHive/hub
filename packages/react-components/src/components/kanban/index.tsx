import React, { useReducer } from 'react';

import styled from 'styled-components'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { AddCard } from './add-card';
import { Button, IconButton, Paper, TextField, Typography } from '@material-ui/core';
import { isEqual } from 'lodash';
import { Column } from './column';
import { Clear } from '@material-ui/icons';

export interface GraphKanbanProps {
    className?: string;
    template?: Array<{ id: string, title: string, status: string }>;
    cards?: any;
    realtime?: any;
    graph: { nodes: Array<any>, links: Array<any> };
    selfish?: boolean;
    onClick?: (args: { item: object }) => void;
    onStatusChange?: (args: { card: object, status: string }) => void;
    onChange?: (args: { value: any }) => void;

    onColumnAdd?: (args: { column: any }) => void;
    onColumnUpdate?: (args: { column: any }) => void;
    onColumnRemove?: (args: { column: any }) => void;

    allowAddColumn?: boolean;
    allowAddCard?: boolean;
    user?: { id: string };
}

const reducer = (state: any, action: any): any => {
    let cards = Object.assign({}, state.cards);

    switch (action.type) {
        case 'ADD_CARD':
            if (!cards[action.column]) cards[action.column] = [];
            cards[action.column] = cards[action.column].concat([action.card]);
            return { cards };
        case 'UPDATE_CARD':
            cards[action.column][action.card] = {
                ...cards[action.column][action.card],
                ...action.data
            }
            return { cards };
        default:
            return state;
    }
}

export const GraphKanban: React.FC<GraphKanbanProps> = ({
    template = [],
    cards = {},
    realtime,
    className,
    onClick,
    onColumnAdd
}) => {

    const [state, dispatch] = realtime || useReducer(reducer, cards)



    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        if (isEqual(sourceId, destId)) {
            dispatch({ type: 'REORDER_COLUMN', column: sourceId, startIx: source.index, destIx: destination.index })
            /* const items = reorder(cards[sourceId], source.index, destination.index);
             cards[sourceId] = items;
 
             _onChange({ value: cards })*/
        } else {
            dispatch({ type: 'MOVE_CARD', startColumn: sourceId, destColumn: destId, source, destination })
            /* const result = move(cards[sourceId], cards[destId], source, destination);
             cards[sourceId] = result[source.droppableId]
             cards[destId] = result[destination.droppableId]
             _onChange({ value: cards })*/
        }

        console.log(result)

    }

    /* const addCard = (colId: string) => {
   //      if(!(realtime ? cards.get(colId) : cards[colId])) realtime ? cards.set(colId, []) : cards[colId] = [];
 //        (realtime ? cards.get(colId) : cards[colId]).push({ id: v4(), draft: true });
 
         dispatch({type: 'ADD_CARD', column: colId, card: {id: v4(), draft: true}})
 
        // _onChange({ value: realtime ? cards.toJSON() : cards })
     }*/


    const [ editing, setEditing ] = React.useState<boolean>(false)

    const [newColumn, setNewColumn] = React.useState<any>({name: ''});

    const addColumn = (e?: any) => {
        if(e) e.stopPropagation()
        setEditing(false)
        if(newColumn && newColumn.name.length > 0 && onColumnAdd){
            onColumnAdd({column: newColumn})
            setNewColumn({name: ''})
        }
        setEditing(true) 
    }

    return (
        <div className={className} onClick={() => setEditing(false)}>
            <div className="kanban-container">
                <DragDropContext onDragEnd={onDragEnd}>
                    {template.map((column, colIndex) => {
                        return (
                            <Column onAdd={onClick} state={state} dispatch={dispatch} id={column.id} key={column.id} title={column.title} />
                        )
                    })}

                    {onColumnAdd && <div className="kanban-column new-column">
                        {editing ? (
                            <Paper onClick={e => e.stopPropagation()} style={{padding:4, backgroundColor: '#079692', flexDirection: 'column', display: 'flex', alignItems: 'flex-start'}}>
                                <TextField
                                    size="small"
                                    value={newColumn.name} 
                                    onChange={(e) => setNewColumn({name: e.target.value})}
                                    onKeyDown={(e) => e.code === "Enter" && addColumn()}
                                    autoFocus 
                                    variant="outlined" 
                                    placeholder="Enter column title" 
                                    fullWidth/>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Button variant="contained" color="primary" onClick={addColumn} style={{marginTop: 4}}>
                                        Add Column
                                    </Button>
                                    <IconButton onClick={() => setEditing(false)} style={{marginLeft: 4}} size="small">
                                        <Clear />
                                    </IconButton>
                                </div>
                                
                            </Paper>
                        ): (
                        <Button fullWidth onClick = { (e) => {
                            e.stopPropagation(); 
                            setEditing(true) 
                         }}>
                            Add column
                        </Button>
                    )}
                    
                </div>}
            </DragDropContext>
        </div>
        </div >
    )
}

export const StyledKanban = styled(GraphKanban)`
    flex: 1;
    display: flex;
    margin-left: 4px;
    position: relative;

    .kanban-container{
        white-space: nowrap;
        overflow-y: hidden;
        overflow-x: auto;
        padding-top: 8px;
        padding-bottom: 8px;

        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
    }


    .kanban-column{
        vertical-align: top;
        position: relative;
        display: inline-block;
        flex-direction: column;
        width: 272px;
        height: 100%;
        background-color: #079692;
        border-radius: 3px;
        margin: 0 4px;
        padding: 0 4px;
    }

    .kanban-column.new-column{
        background: none;
    }

    .new-column > button{
        background: rgba(0, 0, 0, 0.2)
    }

    .new-column > button:hover{
        background: rgba(0, 0, 0, 0.4)
    }

    .kanban-column__header .MuiTypography-root{
        cursor: pointer;
        user-select: none;
        flex: 1;
    }

    .kanban-column__header .MuiTextField-root{

    }

    .kanban-column__header{
        height: 48px;
        display: flex;
        align-items: center;
        padding-left: 8px;
        justify-content: space-between;
        padding: 4px;
        position: relative;
        min-height: 20px;
    }

    .kanban-column__rows{
        position: absolute;
        right: 4px;
        left: 4px;
        top: 52px;
        flex: 1;
    }

    .kanban-row svg{
        color: #6b778c;
        font-size: 20px;
    }

    .kanban-row{
        display: flex;
        flex-direction: column;
        margin-bottom: 8px;
        color: black;
        font-size: 14px;
        background-color: #dfdfdf;
        border-radius: 3px;
        box-shadow: 0 1px 0 rgba(9,30,66,.25);
    }

    .react-trello-board{
        flex: 1;
        height: 100%;
        flex-direction: column;
    }

`