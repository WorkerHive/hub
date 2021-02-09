import { Fab, Paper, Typography } from "@material-ui/core";
import { Add, Delete, Edit } from "@material-ui/icons";
import { GraphKanban, Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";

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
            component: (data: any, params: any) => {
               

                return ((props) => {
                     const [ cols, setCols ] = React.useState<Array<any>>([
                                {id: 0, title: 'Backlog', status: 'to-do', rows:[]},
                                {id: 1, title: 'In Progress', status: 'in-progress', rows:[]},
                                {id: 2, title: 'Review', status: 'review', rows:[]},
                                {id: 3, title: 'Done', status: 'done', rows:[]}
                            ])

                    return (
                        <Paper style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <GraphKanban 
                                onChange={({value}) => {
                                    
                                    setCols(value)
                                }}
                                columns={cols}
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