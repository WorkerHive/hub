import { TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Notes } from '@material-ui/icons'
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { MoreMenu } from '../more-menu';
import { AddCard } from './add-card';

export interface ColumnHeaderProps {
    title: string;
    onChange?: (args: {column: {title: string}}) => void;
}

export const ColumnHeader : React.FC<ColumnHeaderProps> = ({
    title,
    onChange
}) => {
    
    const [editing, setEditing] = React.useState<boolean>(false);

    return (
    <div className="kanban-column__header">
        {editing && onChange ? (
            <TextField 
                onBlur={() => setEditing(false)} 
                onChange={(e) => onChange && onChange({column: {title: e.target.value}})}
                size="small" 
                variant="outlined" 
                placeholder="Column title" 
                value={title} 
                autoFocus />
        ) : (
    <       Typography onClick={() => setEditing(true)} variant="subtitle1">
                {title}
            </Typography>
        )}
        <MoreMenu size="small" square menu={[]} />
    </div>)
}

export interface ColumnProps {
    key: string;
    id: string;
    title: string;
    cards?: Array<{}>;
    state: any;
    dispatch: any;
    onAdd?: (args: {item: any}) => void;
}

export const Column : React.FC<ColumnProps> = ({
    key,
    id,
    title,
    cards,
    onAdd,
    state,
    dispatch
}) => {

    
    const getItemStyle = (isDragging: boolean, dragStyle: any) => {
        return {
            userSelect: 'none',
            background: isDragging ? 'lightgreen' : 'white',
            margin: `0 0 8px 0`,
            padding: '6px 8px 2px',
            ...dragStyle
        }
    }

    
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

        let rowInfo = (
            <div>
                {row.description && <Notes />}

            </div>
        )

        return (
            <Draggable
                index={index}
                draggableId={`row-${colId}-${index}`}
                key={`r-${colId}-${index}`}>
                {(provided, snapshot) => (
                    <div
                        onClick={() => {if(onAdd) onAdd({item: {...row, column: colId}})}}
                        className="kanban-row"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}>
                        
                        {rowBody}

                        {rowInfo}

                    </div>
                )}
            </Draggable>
        )
    }

    return (
        <Droppable key={key} droppableId={`${id}`}>
            {(provided) => (
                <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    <ColumnHeader title={title} />
                    <div className="kanban-column__rows">
                        {(state[id] || []).map((row: any, index: number) => renderCard(row, id, index))}
                    </div>
                    <AddCard onClick={() => {
                        if (onAdd) onAdd({ item: { column: id, draft: false, title: '', description: '' } })
                        //if(addCard) addCard(column.id)
                    }} />
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )
}