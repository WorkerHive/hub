import { Fab, Typography } from "@material-ui/core";
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Edit from "@material-ui/icons/Edit";
import { Header, MoreMenu, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";

export const EQUIPMENT_VIEW = {
        path: '/dashboard/equipment',
        label: "Equipment",
        data: {
            equipment: {
                type: '[Equipment]'
            }
        },
        layout: (sizes : any, rowHeight : number, store: any) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data : any) => {
                    return ((props) => {
                        const selectTab = ({tab}: {tab: string}) => {
                            if(store.state.selectedTab == tab){
                                store.dispatch({selectedTab: null})
                            }else{
                                store.dispatch({selectedTab: tab})
                            }
                        }
                        return (
                            <Header 
                                title={data.label} 
                                selected={store.state.selectedTab}
                                onTabSelect={selectTab}
                                tabs={[...new Set(data.equipment.filter((a: any) => a.type && a.type.length > 0).map((x:any) => x.type))]}/>
                        )
                    })()
                }
            },
            {
                i: 'data',
                x: 0,
                y: 0,
                w: 12,
                h: (sizes.height / rowHeight) - (sizes.width < 600 ? 2 : 1),
                component: (data: any, params: any, type: any, client: any) => {
                    const t: any = {};
                    if (type["Equipment"]) type["Equipment"].def.forEach((_type: any) => {
                        t[_type.name] = _type.type;
                    })

                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);
                        const [ selected, setSelected] = React.useState<any>();

                        const filterSelected = (item: any) => {
                            if(store.state.selectedTab){
                                return item.type == store.state.selectedTab;
                            }
                            return true;
                        }

                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                                <MutableDialog 
                                    title={data.label} 
                                    structure={t} 
                                    data={selected}
                                    onSave={({item} : any) => {
                                        if(item.id){
                                            const id = item.id;
                                         
                                            props.client.actions.updateEquipment(id, item).then(() => {
                                                modalOpen(false)
                                            })
                                        }else{
                                            props.client.actions.addEquipment(item).then(() => {
                                                modalOpen(false)

                                            })
                                        }
                                    }}
                                    onClose={() => {
                                        setSelected(null)
                                        modalOpen(false)}}
                                     open={open} />
                                <SearchTable 
                                    filter={({item, filterText} : any) => item.name.indexOf(filterText) > -1}
                                    renderItem={({item}: {item: any}) => (
                                        <>
                                            <Typography style={{flex: 1}}>{item.name}</Typography>
                                            <MoreMenu menu={[
                                                {
                                                    perm: 'update',
                                                    label:"Edit", 
                                                    icon: <Edit />, 
                                                    action: () => {
                                                        setSelected(item)
                                                        modalOpen(true)
                                                    }
                                                },
                                                {
                                                    perm: 'delete',
                                                    label: "Delete", 
                                                    color: 'red', 
                                                    icon: <Delete />, 
                                                    action: () => {
                                                        props.client.actions.deleteEquipment(item.id)
                                                    }
                                                }
                                            ].filter((a) => client.canAccess("Equipment", a.perm))} />
                                        </>
                                    )} 
                                    data={(data.equipment || []).filter(filterSelected)} />
                                {client.canAccess("Equipment", "create") && <Fab onClick={() => modalOpen(true)} style={{ position: 'absolute', right: 12, bottom: 12 }} color="primary">
                                    <Add />
                                </Fab>}
                            </div>
                        )
                    })({client})
                }
            }
        ]
    }