import { Fab, Typography } from "@material-ui/core"
import Add from '@material-ui/icons/Add'
import Edit from "@material-ui/icons/Edit"
import { MSContactCard } from '@workerhive/parsers';
import { MutableDialog, Header, SearchTable, MoreMenu, FileDrop } from "@workerhive/react-ui"
import qs from "qs";

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
                component: (data: any) => (
                    <Header 
                        onTabSelect={({tab}) => {
                            let query = qs.parse(window.location.search, {ignoreQueryPrefix: true})
                            query.type = tab.toLowerCase();
                            window.location.search = qs.stringify(query)
                            console.log(tab)
                        }}
                        title={data.label} 
                        tabs={["People", "Companies"]} />
                )
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

                    let models = [client.models.find((a : any) => a.name == "ContactOrganisation")]
                    models[0].data = data.organisations

                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);
                        const [ selected, setSelected ] = React.useState<any>();

                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                                <MutableDialog
                                    models={models} 
                                    title={data.label} 
                                    data={selected}
                                    structure={t} 
                                    onSave={({item} : any) => {
                                        if(item.id){
                                            const id = item.id;
                                            props.client.actions.updateContact(id, item).then(() => {
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
                            <FileDrop accept={[".contact"]} noClick onDrop={({files}) => {
                                if(files.length == 1){
                                    var fr = new FileReader();
                                    fr.onload = (e) => {
                                        let data = e.target?.result;
                                        if(data){
                                            let contact = new MSContactCard(data.toString());
                                            
                                            setSelected({
                                                name: contact?.names && contact?.names[0].formattedName,
                                                email: contact?.emails && contact?.emails[0].address
                                            })

                                            modalOpen(true);

                                            console.log("Contact", contact)
                                        }
                                    }

                                    fr.readAsText(files[0])
                                }
                                console.log("Contact files", files)
                            }}>
                                {(isDragActive: boolean) => (
                                <SearchTable 
                                    renderItem={({item}: any) => (
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
                                )}
                            </FileDrop>
                              {client.canAccess("Contact", "create") &&   <Fab onClick={() => modalOpen(true)} style={{ position: 'absolute', right: 12, bottom: 12 }} color="primary">
                                    <Add />
                                </Fab>}
                            </div>
                        )
                    })({client})
                }
            }
        ]
    }