import { Divider, Fab, ListItem, Typography } from "@material-ui/core";
import { Add, Delete, Edit, Email } from "@material-ui/icons";
import { Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";

export const TEAM_VIEW = {
        path: '/dashboard/team',
        label: "Team",
        data: {
            team: {
                type: "[TeamMember]"
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
                                            props.client.actions.updateTeamMember(id, item).then(() => {
                                                modalOpen(false)
                                            })
                                        }else{
                                            props.client.actions.addTeamMember(item).then(() => {
                                                modalOpen(false)
                                            })
                                        }
                                       
                                    }}
                                    onClose={() => modalOpen(false)}
                                    open={open} />

                                <SearchTable 
                                    renderItem={({item} : {item: any}) => [
                                        <>
                                           <Typography style={{flex: 1}}>{item.name || item.username}</Typography>
                                           <MoreMenu menu={[
                                               {icon: <Edit />, label: "Edit", action: () => {
                                                   setSelected(item);
                                                   modalOpen(true)
                                               }},
                                               {icon: <Delete />, label: "Delete", color: 'red', action: () => {
                                                   props.client.actions.deleteTeamMember(item.id)
                                               }},
                                               {
                                                   icon: <Email />,
                                                   label: "Invite",
                                                   action: () => {
                                                       props.client.actions.inviteTeamMember(item.id)
                                                   }
                                               }
                                           ]} />
                                        </>
                                       
                                    ]} 
                                    data={data.team || []} />

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