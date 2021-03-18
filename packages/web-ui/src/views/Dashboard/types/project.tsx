import { Fab, Paper, Typography } from "@material-ui/core";
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Edit from "@material-ui/icons/Edit";
import { useRealtime, WorkhubClient } from "@workerhive/client";
import * as Y from 'yjs';
import KanbanDialog from '../../../components/kanban-dialog';
import { GraphKanban, Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";
import { v4 } from 'uuid';
import { isEqual } from "lodash";


export const PROJECT_DRILLDOWN = {
    path: '/dashboard/projects/:id',
    label: "Project Drilldown",
    data: {
        project: {
            type: 'Project',
            query: (params: any) => ({
                id: params.id
            })
        },
    },
    layout: (sizes: any, rowHeight: number) => [
        {
            i: 'header',
            x: 0,
            y: 0,
            w: 12, 
            h: 1,
            component: (data: any, params: any, types: any, client: any) => {
                return (<Header title={data.project ? data.project.name : ''} user={client.user} connected={client.realtimeSync.status}/>)
            }
        },
        {
            i: 'body',
            x: 0,
            y: 1,
            w: 12, 
            h: sizes.height / rowHeight - 1,
            component: (data: any, params: any, types: any, client: any) => {
               
                return ((props) => {

                    const [ selected, setSelected ] = React.useState<any>(null)
                    const [ modalOpen, openModal ] = React.useState<boolean>(false);

                    const [ cols, setCols ] = React.useState<Array<any>>([
                                {id: 'backlog', title: 'Backlog', status: 'to-do', rows:[]},
                                {id: 'in-progress', title: 'In Progress', status: 'in-progress', rows:[]},
                                {id: 'review', title: 'Review', status: 'review', rows:[]},
                                {id: 'done', title: 'Done', status: 'done', rows:[]}
                            ])
                    
            
                    const project : Y.Map<Y.Array<Y.Map<any>>> = client.realtimeSync?.doc.getMap(`project-${data.project.id}-plan`)
                    
                    const mgmt = useRealtime(project, (state, action) => {
                        //  let p = project.toJSON();
                          console.log(project.toJSON(), state, action)
                          
                          switch(action.type){
                              case 'ADD_CARD':
                                  if(!action.card.id) action.card.id = v4();
                                  if(action.card.column) delete action.card.column;

                                  let column = project.get(action.column);
                                  if(column === undefined){
                                      column = new Y.Array();
                                      project.set(action.column, column)
                                  } 
                                  
                                  let card = new Y.Map();
                                  column.push([card]);
                                  
                                  Object.keys(action.card).map((x) => {
                                      card.set(x, action.card[x])
                                  })

                                  return project.toJSON()
                                case 'UPDATE_CARD':
                                    let col = project.get(action.column)
                                    let card_ix : number = typeof(action.card) === 'number' ? action.card : col?.toArray().map((x) => x.toJSON().id).indexOf(action.card)
                                    console.log("Update card", action, card_ix, col)
                                    if(card_ix > -1){
                                        Object.keys(action.data).map((x) => {
                                            col?.get(card_ix).set(x, action.data[x]);
                                        })
                                    }
                        
                                  return project.toJSON()
                                case 'REMOVE_CARD':
                                    let cols = project.get(action.column)
                                    let ix : number = typeof(action.card) === 'number' ? action.card : cols?.toArray().map((x) => x.toJSON().id).indexOf(action.card)
                                    if(ix > -1){
                                        cols?.delete(ix);
                                    }
                                    return project.toJSON();
                                case 'MOVE_CARD':
                                    let mc = project.get(action.startColumn)?.get(action.source.index)

                                    let dc = project.get(action.destColumn)
                                    if(!dc){
                                        dc = new Y.Array();
                                        project.set(action.destColumn, dc);
                                    }
                                    if(mc){
                                        let _card = new Y.Map();
                                        mc.forEach((value, key) => {
                                            _card.set(key, value instanceof Y.AbstractType ? value.clone() : value);
                                        })

                                        project.get(action.startColumn)?.delete(action.source.index, 1);

                                        dc.insert(action.destination.index, [_card])

                                    }
                                    return project.toJSON();
                                case 'REORDER_COLUMN':
                                    let c : Y.Map<any> | undefined = project.get(action.column)?.get(action.startIx);

                                    if(c){
                                        let _card = new Y.Map();
                                        c.forEach((value, key) => {
                                            _card.set(key, value instanceof Y.AbstractType ? value.clone() : value);
                                        })

                                        project.get(action.column)?.delete(action.startIx, 1);
                                        project.get(action.column)?.insert(action.destIx, [_card])
                                    }
                                    
                                    return project.toJSON();
                              default:
                                  return state;
                          }
                      })

                    console.log(project.toJSON());

                    return (
                        <Paper style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <KanbanDialog
                                data={selected}
                                onArchive={() => {
                                    mgmt[1]({type: 'REMOVE_CARD', column: selected.column, card: selected.id})
                                    openModal(false);
                                }}
                                onClose={() => {
                                    openModal(false)
                                }}
                                onSave={(data) => {
                                    let column = data.column;
                                    let card = data.id;
                                    delete data.id;
                                    delete data.column

                                    console.log('onSave', data, card, column)
                                    const dispatch = mgmt[1];

                                    if(card){
                                     dispatch({type: 'UPDATE_CARD', column: column, card: card, data: data})
                                     console.log("Save card ", data)
                                     openModal(false);
                                    }else{
                                        console.log("Add card", data)
                                        dispatch({type: 'ADD_CARD', column: column, card: data})
                                        openModal(false);
                                    }
                                }}
                                open={modalOpen}
                                 />
                            <GraphKanban 
                                template={cols}
                                realtime={mgmt}
                                cards={project.toJSON()}
                                onClick={({item}) => {
                                    console.log("Clicked", item)
                                    openModal(true)
                                    setSelected(item)
                                }}
                                onChange={({value}) => {
                                    let v = value;
                                    if(value instanceof Y.Map){
                                        v = value.toJSON();
                                    }
                                    console.log(typeof(value), value, v)
                                }}
                                graph={{nodes: [], links: []}} />
                        </Paper>
                    )
                }
                    
                )({})
            }
        }
    ]
}

export const PROJECT_VIEW = {
        path: '/dashboard/projects',
        label: "Projects",
        data: {
            projects: {
                type: '[Project]',
                query: () => ({

                })
            }
        },
        layout: (sizes : any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data: any, params: any, types: any, client: any) => (<Header title={data.label} user={client.user} connected={client.realtimeSync.status} />)
            },
            {
                i: 'data',
                x: 0,
                y: 1,
                w: 12,
                h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
                component: (data: any, params: any, types: any, client: any) => {
                    const t: any = {};
                    if (types["Project"]) types["Project"].def.forEach((_type: any) => {
                        t[_type.name] = _type.type;
                    })
                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);
                        const [ selected, setSelected] = React.useState<any>();
                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                                <MutableDialog 
                                    title={data.label} 
                                    data={selected}
                                    structure={t} 
                                    onSave={({item} : any) => {
                                        if(item.id){
                                            const id = item.id;
                                          
                                            props.client.actions.updateProject(id, item).then(() => modalOpen(false))
                                        }else{
                                            props.client.actions.addProject(item).then(() => modalOpen(false))
                                        }
                                    }}
                                    onClose={() => {
                                        modalOpen(false)
                                        setSelected(null)
                                    }}
                                     open={open} />

                                <SearchTable 
                                    filter={({item, filterText}) => item.name.indexOf(filterText) > -1}
                                    renderItem={({item}: {item: any}) => (
                                       <div style={{cursor: 'pointer', alignItems: 'center', flex: 1, display: 'flex'}} onClick={() => {params.navigate(`/dashboard/projects/${item.id}`)}}>

                                        <Typography style={{flex: 1}}>{item.name}</Typography>
                                        <MoreMenu menu={[
                                            {
                                                perm: 'update',
                                                label: "Edit", 
                                                icon: <Edit />, 
                                                action: () => {
                                                    setSelected(item)
                                                    modalOpen(true)
                                                }
                                            },
                                            {
                                                perm: 'delete',
                                                label: "Delete", 
                                                icon: <Delete />, 
                                                color: 'red'
                                            }
                                        ].filter((a) => client.canAccess("Project", a.perm))} />
                                       
                                       </div> 
                                    )}
                                    data={data.projects.filter((a : any) => a.name && a.name.length > 0) || []} />
                                {client.canAccess("Project", "create") &&  <Fab onClick={() => modalOpen(true)} style={{ position: 'absolute', right: 12, bottom: 12 }} color="primary">
                                    <Add />
                                </Fab>}
                            </div>
                        )
                    })({client})
                }
            }
        ]
    }