import React, { useReducer } from 'react';

import styled from 'styled-components'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { AddCard } from './add-card';
import { TextField, Typography } from '@material-ui/core';
import { isEqual } from 'lodash';

export interface GraphKanbanProps {
    className?: string;
    template?: Array<{id: string, title: string, status: string}>;
    cards?: any;
    realtime?: any;
    graph: { nodes: Array<any>, links: Array<any> };
    selfish?: boolean;
    onClick?: (args: { item: object }) => void;
    onStatusChange?: (args: { card: object, status: string }) => void;
    onChange?: (args: { value: any }) => void;
    allowAddColumn?: boolean;
    allowAddCard?: boolean;
    user?: { id: string };
}

const reducer = (state : any, action : any) : any => {
    let cards = Object.assign({}, state.cards);

    switch(action.type){
        case 'ADD_CARD':
            if(!cards[action.column]) cards[action.column] = [];
            cards[action.column] = cards[action.column].concat([action.card]);
            return {cards};
        case 'UPDATE_CARD':
            cards[action.column][action.card] = {
                ...cards[action.column][action.card],
                ...action.data
            }
            return {cards};
        default:
            return state;
    }
}

export const GraphKanban: React.FC<GraphKanbanProps> = ({
    template = [],
    cards = {},
    realtime,
    className,
    onClick
}) => {

    const [ state, dispatch ] = realtime || useReducer(reducer, cards)


    const getItemStyle = (isDragging: boolean, dragStyle: any) => {
        return {
            userSelect: 'none',
            background: isDragging ? 'lightgreen' : 'white',
            margin: `0 0 8px 0`,
            padding: '6px 8px 2px',
            ...dragStyle
        }
    }


    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        if (isEqual(sourceId, destId)) {
            dispatch({type: 'REORDER_COLUMN', column: sourceId, startIx: source.index, destIx: destination.index})
           /* const items = reorder(cards[sourceId], source.index, destination.index);
            cards[sourceId] = items;

            _onChange({ value: cards })*/
        } else {
            dispatch({type: 'MOVE_CARD', startColumn: sourceId, destColumn: destId, source, destination })
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

    const changeCard = (colId: string, card: number, data: any) => {
        dispatch({type: 'UPDATE_CARD', column: colId, card: card, data: data})
    }

    const renderCard = (row: any, colId: string, index: number) => {
        let rowBody : any;

        if(row.draft){
            rowBody = (
                <TextField
                    multiline
                    variant="standard"
                    value={row.title}
                    onChange={(e) => changeCard(colId, index, {title: e.target.value})} 
                    onKeyDown={(e) => {
                        console.log(e)
                        if(e.key === 'Enter' || e.keyCode === 13 || e.which === 13){
                            changeCard(colId, index, {draft: false})
                        }
                    }}    
                    style={{flex: 1, outline: 'none', border: 'none'}}
                    placeholder="Enter a title for this card" />
            )
        }else{
            rowBody = (
                <Typography variant="subtitle2">{row.title}</Typography>
            )
        }

        return (
            <Draggable
                index={index}
                draggableId={`row-${colId}-${index}`}
                key={`r-${colId}-${index}`}>
                {(provided, snapshot) => (
                    <div
                        onClick={() => {if(onClick) onClick({item: {...row, column: colId}})}}
                        className="kanban-row"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}>
                        
                        {rowBody}

                    </div>
                )}
            </Draggable>
        )
    }

    return (
        <div className={className}>
            <DragDropContext onDragEnd={onDragEnd}>
                {template.map((column, colIndex) => {
                    return (
                        <Droppable key={colIndex} droppableId={`${column.id}`}>
                            {(provided) => (
                                <div
                                    className="kanban-column"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="kanban-column__header">
                                        {column.title}
                                    </div>
                                    <div className="kanban-column__rows">
                                        {(state[column.id] || []).map((row: any, index: number) => renderCard(row, column.id, index))}
                                    </div>
                                    <AddCard onClick={() => {
                                        if(onClick) onClick({item: {column: column.id, draft: false, title: '', description: ''}})
                                        //if(addCard) addCard(column.id)
                                    }} />
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    )
                })}
            </DragDropContext>

        </div>
    )
}

export const StyledKanban = styled(GraphKanban)`
    flex: 1;
    display: flex;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-left: 4px;

    .kanban-column{
        position: relative;
        display: flex;
        flex-direction: column;
        width: 272px;
        background-color: #079692;
        border-radius: 3px;
        margin: 0 4px;
        padding: 0 4px;
    }

    .kanban-column__header{
        padding: 10px 8px;
        padding-right: 36px;
        position: relative;
        min-height: 20px;
    }

    .kanban-column__rows{
        position: absolute;
        right: 4px;
        left: 4px;
        top: 40px;
        flex: 1;
    }

    .kanban-row{
        display: flex;
        
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