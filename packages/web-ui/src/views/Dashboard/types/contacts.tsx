import { Fab, Typography } from "@material-ui/core"
import { Add, Edit } from "@material-ui/icons"
import { MutableDialog, Header, SearchTable, MoreMenu } from "@workerhive/react-ui"

import React from "react"

export const CONTACT_VIEW = {
        path: '/dashboard/contacts',
        label: "Contacts",
        data: {
            contacts: {
                type: '[Contact]'
            },
            organisations: {
                type: '[ContactOrganisation]'
            }
        },
        layout: (sizes : any, rowHeight : number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data: any) => (<Header title={data.label} tabs={["People", "Companies"]} />)
            },
            {
                i: 'data',
                x: 0,
                y: 1,
                w: 12,
                h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
                component: (data: any, params: any, type: any, client: any) => {
                    const t: any = {};
                    console.log(type)
                    if (type["Contact"]) type["Contact"].def.forEach((_type: any) => {
                        t[_type.name] = _type.type;
                    })
                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);
                        const [ selected, setSelected ] = React.useState<any>();

                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                                <MutableDialog 
                                    title={data.label} 
                                    data={selected}
                                    structure={t} 
                                    onSave={({item} : any) => {
                                        if(item.id){
                                            const id = item.id;
                                            delete item.id;
                                            props.client.action.updateContact(id, item).then(() => {
                                                modalOpen(false);
                                            })
                                        }else{
                                            props.client.actions.addContact(item).then(() => {
                                                modalOpen(false);
                                            })
                                        }
                                       
                                      
                                    }}
                                    onClose={() => modalOpen(false)}
                                     open={open} />
                                <SearchTable renderItem={({item}: {item: any}) => (
                                    <div style={{display: 'flex', flex: 1, alignItems: 'center'}}>
                                        <Typography style={{flex: 1}}>{item.name}</Typography>
                                        <MoreMenu menu={[
                                            {label: "Edit", icon: <Edit />, action: () => {
                                                setSelected(item)
                                                modalOpen(true)
                                            }}
                                        ]}/>
                                    </div>
                                )} data={data.contacts || []} />
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