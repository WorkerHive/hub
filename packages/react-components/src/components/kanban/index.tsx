import React from 'react';

import moment from 'moment';
import { TeamCircles } from '../..';
import styled from 'styled-components'
import { DragDropContext, Draggable, DraggableLocation, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd'
import { AddCard } from './add-card';
import { v4 } from 'uuid';
import { TextField, Typography } from '@material-ui/core';

export interface GraphKanbanProps {
    className?: string;
    graph: { nodes: Array<any>, links: Array<any> };
    columns?: Array<any>;
    selfish?: boolean;
    onClick?: (args: { item: object }) => void;
    onStatusChange?: (args: { card: object, status: string }) => void;
    onChange?: (args: { value: Array<any> }) => void;
    allowAddColumn?: boolean;
    allowAddCard?: boolean;
    user?: { id: string };
}

export const GraphKanban: React.FC<GraphKanbanProps> = ({
    graph = { nodes: [], links: [] },
    columns = [],
    className,
    selfish = false,
    allowAddColumn = false,
    allowAddCard = true,
    onClick,
    onStatusChange,
    onChange,
    user = {}
}) => {
    const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const move = (source: Array<any>, destination: Array<any>, droppableSource: DraggableLocation, droppableDestination: DraggableLocation) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result: any = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };

    const getItemStyle = (isDragging: boolean, dragStyle: any) => {
        return {
            userSelect: 'none',
            background: isDragging ? 'lightgreen' : 'white',
            margin: `0 0 8px 0`,
            padding: '6px 8px 2px',
            ...dragStyle
        }
    }

    const getColumns = () => {
        const cols = columns.map((col: any) => {
            let cards: Array<any> = [];
            if (col.status) {
                cards = graph.nodes.filter((a) => {
                    return a.data.status == col.status
                }) || []
            } else if (typeof (col.numParents) == "number") {
                cards = graph.nodes.filter((node) => {
                    return graph.links.filter((link) => link.target == node.id).length <= col.numParents
                }) || []
            }

            return {
                ...col,
                cards: cards.filter((a: any) => {
                    if (!selfish) return true;
                    if (selfish) return (a.members || []).indexOf(user.id) > -1
                }).sort((a: any, b: any) => {

                    if (!(a.data && a.data.dueDate)) a.data.dueDate = Infinity;
                    if (!(b.data && b.data.dueDate)) b.data.dueDate = Infinity

                    return a.data.dueDate - b.data.dueDate
                }).map((x: any) => {
                    let parents = graph.links.filter((a) => a.target == x.id).map((y) => graph.nodes.filter((a) => a.id == y.source)[0])
                    return {
                        ...x,
                        title: x.data.label,
                        description: parents.length > 0 && parents[0].data.label,
                    }
                })
            }
        })
        console.log(cols);
        return cols;
    }

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }

        const sInd = +source.droppableId
        const dInd = +destination.droppableId

        console.log(source.droppableId, sInd)

        if (sInd === dInd) {
            const items = reorder(columns[sInd].rows, source.index, destination.index);
            columns[sInd].rows = items;
            if (onChange) onChange({ value: columns })
        } else {
            const result = move(columns[sInd].rows, columns[dInd].rows, source, destination);
            columns[sInd].rows = result[source.droppableId]
            columns[dInd].rows = result[destination.droppableId]
            if (onChange) onChange({ value: columns })
        }

        console.log(result)

    }

    const addCard = (index: number) => {
        let cols = columns.slice();
        cols[index].rows.push({ id: v4(), draft: true });
        if (onChange) onChange({ value: cols })
    }

    const changeCard = (col: number, card: number, data: any) => {
        let cols = columns.slice();
        cols[col].rows[card] = {
            ...columns[col].rows[card],
            ...data
        }
        if(onChange) onChange({ value: cols });
    }

    const renderCard = (row: any, colIndex: number, index: number) => {
        let rowBody : any;

        if(row.draft){
            rowBody = (
                <textarea
                    value={row.title}
                    onChange={(e) => changeCard(colIndex, index, {title: e.target.value})} 
                    onKeyDown={(e) => {
                        console.log(e)
                        if(e.key === 'Enter' || e.keyCode === 13 || e.which === 13){
                            changeCard(colIndex, index, {draft: false})
                        }
                    }}    
                    style={{flex: 1, outline: 'none', border: 'none'}}
                    placeholder="Enter a title for this card" />
            )
        }else{
            rowBody = (
                <Typography variant="h6">{row.title}</Typography>
            )
        }

        return (
            <Draggable
                index={index}
                draggableId={`row-${colIndex}-${index}`}
                key={`r-${colIndex}-${index}`}>
                {(provided, snapshot) => (
                    <div
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
                {columns.map((column, colIndex) => {
                    return (
                        <Droppable key={colIndex} droppableId={`${colIndex}`}>
                            {(provided, snapshot) => (
                                <div
                                    className="kanban-column"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="kanban-column__header">
                                        {column.title}
                                    </div>
                                    <div className="kanban-column__rows">
                                        {column.rows.map((row: any, index: number) => renderCard(row, colIndex, index))}
                                    </div>
                                    <AddCard onClick={() => addCard(colIndex)} />
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

/*this

 <Board
            draggable
            editable
            onCardClick={(clicked: any) => console.log(clicked)}
            data={{
                lanes: [
                    {
                        id: 'lane1',
                        title: 'Planned Tasks',
                        label: '2/2',
                        cards: [
                            {id: 'card-1', title: 'Test Card', label: '30 mins', draggable: true}
                        ]
                    },
                    {
                        id: 'lane2',
                        title: 'In Progress',
                        label: '3/2',
                        cards: [
                            {id: 'card-2', title: 'Tester Card', draggable: true}
                        ]
                    }
                ]
            }}
            onDragStart={(evt: any) => console.log("Drag start", evt)}
            onDragEnd={(evt: any) => console.log("Drag end", evt)}
            renderCard={(row : any) => {
                return (
                    <div>
                        {row.name}    
                    </div>
                )
            }}
        
        />
            

allowAddColumn={allowAddColumn}
            allowAddCard={allowAddCard}
            renderCard={(card : any) => {
                return (
                    <div onClick={() => {
                        if(onClick){
                            onClick({item: card})
                        }
                    }} className="react-kanban-card">
                        <div className="react-kanban-card__title">
                            {card.title}

                        </div>
                        {card.data.dueDate != Infinity && <div style={{textAlign: 'left'}}>
                                ETA: {moment(new Date(card.data.dueDate * 1000)).format('DD/MM/yyyy')}
                            </div>}
                        <div>
                            {card.description}
                        </div>
                        <TeamCircles members={(!Array.isArray(card.members) && typeof(card.members) == "object") ? [] : card.members || []} />

                    </div>
                )
            }}
            onCardDragEnd={(card : any, source : any, destination : any) => {
                console.log(source, destination)
                let cols = columns.slice()

                let fromIx = cols.map((x) => x.id).indexOf(source.fromColumnId);
                let toIx = cols.map((x) => x.id).indexOf(destination.toColumnId)

                let spliced = cols[fromIx].cards.splice(source.fromPosition, 1)
                cols[toIx].cards.splice(destination.toPosition, 0, spliced[0])


                if(onStatusChange) onStatusChange({card: card, status: template.filter((a) => a.id == destination.toColumnId)[0].status})
                if(onChange) onChange({value: cols})
                setColumns(cols)
            }}
            onColumnDragEnd={(_obj : any, source : any, destination : any) => {
                let cols = columns.slice()

                let spliced = cols.splice(source.fromPosition, 1)[0]
                cols.splice(destination.toPosition, 0, spliced)
                //if(onChange) onChange(cols)
                //setColumns(cols)
            }}
            children={{columns: getColumns()}} />

*/
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
        background-color: #ebecf0;
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
        background-color: white;
        border-radius: 3px;
        box-shadow: 0 1px 0 rgba(9,30,66,.25);
    }

    .react-trello-board{
        flex: 1;
        height: 100%;
        flex-direction: column;
    }

`