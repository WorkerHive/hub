import { Fab } from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import { Header, MutableDialog, SearchTable } from "@workerhive/react-ui";
import React from "react";

export const KNOWLEDGE_VIEW = {
        path: '/dashboard/kb',
        label: "Knowledge",
        data :{
            kb: {
                type: '[Knowledge]'
            }
        },
        layout: (sizes: any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data:any) => (<Header title="Knowledge Base" />)
            },
            {
                i: 'editor',
                x: 0,
                y: 1,
                w: 12,
                h: (sizes.height / rowHeight) - 1,
                component: (data: any, params: any, type: any, client: any) => {
                    const t: any = {};
                    if (type["Knowledge"]) type["Knowledge"].def.forEach((_type: any) => {
                        t[_type.name] = _type.type;
                    })
                    return ((props) => {
                        const [open, modalOpen] = React.useState<boolean>(false);

                        return (
                            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                                <MutableDialog 
                                    title={"Knowledge"} 
                                    structure={t} 
                                    onSave={({item}) => {
                                        props.client.actions.addKnowledge(item)
                                        modalOpen(false)
                                    }}
                                    onClose={() => modalOpen(false)}
                                     open={open} />
                                <SearchTable renderItem={(item: any) => item.title} data={data.kb || []} />
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