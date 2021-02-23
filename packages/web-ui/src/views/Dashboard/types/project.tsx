import { Fab, Paper, Typography } from "@material-ui/core";
import { Add, Delete, Edit } from "@material-ui/icons";
import { useRealtime, WorkhubClient } from "@workerhive/client";
import * as Y from 'yjs';
import { GraphKanban, Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";
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

                    console.log("Component rendered")
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
                                    console.log("Update card", action)
                                    Object.keys(action.data).map((x) => {
                                        project.get(action.column)?.get(action.card).set(x, action.data[x]);
                                    })
                        
                                  return project.toJSON()
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
                            <GraphKanban 
                                template={cols}
                                realtime={mgmt}
                                cards={project.toJSON()}
                                onChange={({value}) => {
                                    let v = value;
                                    if(value instanceof Y.Map){
                                        v = value.toJSON();
                                    }
                                    console.log(typeof(value), value, v)

                                    /*Object.keys(value).map((x) => {

                                        project.set(x, value[x])
                                    })*/


                                   /* value.forEach((item, index) => {
                                        if(!project.get(index)){

                                        //    project.insert(index, [map])
                                        }
                                        if(!isEqual(item.rows, project.get(index).get('rows'))){
                                            project.get(index).set('rows', item.rows);
                                        }
                                    })*/
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
                                            delete item.id;
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
                                    renderItem={({item}: {item: any}) => (
                                       <div style={{cursor: 'pointer', alignItems: 'center', flex: 1, display: 'flex'}} onClick={() => {params.navigate(`/dashboard/projects/${item.id}`)}}>

                                        <Typography style={{flex: 1}}>{item.name}</Typography>
                                        <MoreMenu menu={[
                                            {label: "Edit", icon: <Edit />, action: () => {
                                                setSelected(item)
                                                modalOpen(true)
                                            }},
                                            {label: "Delete", icon: <Delete />, color: 'red'}
                                        ]} />
                                       
                                       </div> 
                                    )}
                                    data={data.projects.filter((a : any) => a.name && a.name.length > 0) || []} />
                                <Fab onClick={() => modalOpen(true)} style={{ position: 'absolute', right: 12, bottom: 12 }} color="primary">
                                    <Add />
                                </Fab>
                            </div>
                        )
                    })({client})
                }
            }
        ]
    }