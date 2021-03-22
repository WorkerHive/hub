import React from 'react';
import { Header, CRUDList, MutableDialog } from "@workerhive/react-ui"
import { Divider, Fab, List, ListItem, Paper } from '@material-ui/core';
import { Add } from '@material-ui/icons';

export const SITE_FEEDBACK = {
    path: '/dashboard/feedback',
    label: "Feedback",
    data: {
        feedback: {
            type: '[SiteFeedback]'
        }
    },
    layout: (sizes: any, rowHeight: any) => [
        {
            i: 'header',
            x: 0,
            y: 0,
            w: 12,
            h: 1,
            component: (data: any) => (
                <Header title={data.label} />
            )
        },
        {
            i: 'data',
            x: 0,
            y: 1,
            w: 12,
            h: (sizes.height / rowHeight) -1,
            component: (data: any, params: any, type: any, client: any) => {
                const t: any = {};
                if(type['SiteFeedback']) type['SiteFeedback'].def.forEach((_type: any) => {
                    t[_type.name] = _type.type;
                })

                console.log(data)
                
                return ((props : any) => {
                    const [ open, setOpen ] = React.useState<boolean>(false);
                    const closeModal = () => {
                        setOpen(false);
                    }

                    const filterFeedback = (item: {from: string, message: string}) => {
                        if(!client?.canAccess("SiteFeedback", "delete")){
                            return item.from == client?.user.name;
                        }else{
                            return true;
                        }
                    }

                    return (
                        <Paper style={{flex: 1, display: 'flex', position: 'relative'}}>
                            <MutableDialog
                                structure={{
                                    from: 'String',
                                    subject: 'String',
                                    message: 'Description'
                                }}
                                title={"Leave Feedback"}
                                open={open}
                                data={{from: client?.user.name}}
                                onSave={({item}) => {
                                    client?.actions.addSiteFeedback(item)
                                    console.log(item)
                                    closeModal()
                                }}
                                onClose={closeModal}
                                />
                            <List style={{flex: 1}}>
                                {data.feedback.filter(filterFeedback).map((x: any) => (
                                    <>
                                    <ListItem>
                                        {x.subject}
                                    </ListItem>
                                    <Divider />
                                    </>
                                ))}
                            </List>
                            <Fab 
                                color="primary"
                                onClick={() => setOpen(true)} 
                                style={{position: 'absolute', right: 8, bottom: 8}}>
                                <Add />
                            </Fab>
                        </Paper>
                    )
                })({})
            }
        }
    ]
}