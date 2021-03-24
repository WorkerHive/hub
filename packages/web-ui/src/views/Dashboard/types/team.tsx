import { Divider, Fab, ListItem, Typography } from "@material-ui/core";
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Email  from '@material-ui/icons/Email';
import { WorkhubClient } from "@workerhive/client";
import { Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";

export const TEAM_VIEW = {
        path: '/dashboard/team',
        label: "Team",
        data: {
            team: {
                type: "[TeamMember]"
            },
            roles: {
                type: '[Role]'
            }
        },
        layout: (sizes : any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data: any) => (<Header title={data.label} />)
            },
            {
                i: 'data',
                x: 0,
                y: 0,
                w: 12,
                h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
                component: (data: any, params: any, type: any, client: any) => {
                    const t: any = {};
                    if (type["TeamMember"]) type["TeamMember"].def.forEach((_type: any) => {
                        if(_type.directives.map((x: {name: string}) => x.name).indexOf('input') > -1) t[_type.name] = _type.type;
                    })

                    let models = [client.models.find((a : any) => a.name == "Role")]
                    models[0].data = data.roles;

                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);
                        const [ selected, setSelected] = React.useState<any>();
                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                                <MutableDialog 
                                    title={data.label} 
                                    data={selected}
                                    models={models}
                                    structure={t}
                                    onSave={({item} : any) => {
                                        if(item.id){
                                            const id = item.id;
                                           // delete item.id;
                                            props.client.actions.updateTeamMember(id, item).then(() => {
                                                modalOpen(false)
                                                setSelected(null)
                                            })
                                        }else{
                                            props.client.actions.addTeamMember(item).then(() => {
                                                modalOpen(false)
                                                setSelected(null)
                                            })
                                        }
                                       
                                    }}
                                    onClose={() => {
                                        modalOpen(false)
                                        setSelected(null)
                                    }}
                                    open={open} />

                                <SearchTable
                                    actions={client.crudAccess("TeamMember")}
                                    onCreate={() => modalOpen(true)}
                                    options={[
                                        {
                                            type: 'update', 
                                            label: "Edit",
                                            color: 'white',
                                            icon: <Edit />,
                                            action: (item: any) => {
                                                setSelected(item)
                                                modalOpen(true)
                                            
                                            }
                                        },
                                        {
                                            type: 'update',
                                            label: "Invite",
                                            color: 'white',
                                            icon: <Email />
                                        },
                                        {
                                            type: 'delete',
                                            label: "Delete",
                                            color: "#f1682f",
                                            icon: <Delete />,
                                            action: (item: any) => {
                                                props.client.actions.deleteTeamMember(item.id)
                                            }
                                        }
                                    ]}
                                    columns={[
                                        {
                                            label: "ID",
                                            key: "id",
                                            flex: 0.15
                                        },
                                        {
                                            label: "Name",
                                            key: "name",
                                            flex: 0.85
                                        }
                                    ]}
                                    filter={({item, filterText}) => item.name.indexOf(filterText) > -1}
                                    data={data.team || []} /> 
                            </div>
                        )
                    })({client})
                }
            }
        ]
    }


    /*

     <MoreMenu menu={[
                                                {
                                                   perm: 'update',
                                                   icon: <Edit />, 
                                                   label: "Edit", 
                                                   action: () => {
                                                    setSelected(item);
                                                    modalOpen(true)
                                                   }
                                                },
                                               {
                                                   perm: 'delete',
                                                   icon: <Delete />, 
                                                   label: "Delete", 
                                                   color: 'red', 
                                                   action: () => {
                                                       props.client.actions.deleteTeamMember(item.id)
                                                   }
                                               },
                                               {
                                                   perm: 'update',
                                                   icon: <Email />,
                                                   label: "Invite",
                                                   action: () => {
                                                       props.client.actions.inviteTeamMember(item.id)
                                                   }
                                               }
                                           ].filter((a) => client.canAccess("TeamMember", a.perm))} />
                                        </>
                                       
                                    ]} 
    */