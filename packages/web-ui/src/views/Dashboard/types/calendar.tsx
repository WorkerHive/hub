import { Paper } from "@material-ui/core";
import { WorkhubClient, useHub } from "@workerhive/client";
import { Calendar, Header, MutableDialog } from "@workerhive/react-ui";
import React from "react";

export const CALENDAR_VIEW =  {
        path: '/dashboard/calendar',
        label: "Calendar",
        data: {
            projects: {
                type: '[Project]'
            },
            scheduleItems: {
                type: '[Schedule]',
                poll: 15 * 1000
            },
            people: {
                type: '[TeamMember]'
            },
            equipment: {
                type: '[Equipment]'
            }
        },
        layout: (sizes: any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12,
                h: 1,
                component: (data: any) => <Header title={"Calendar"} />,
            },
            {
                i: 'data',
                x: 0,
                y: 1,
                w: 12,
                h: sizes.height / rowHeight - 1, 
                component: (data: any, params: any, type: any, client?: WorkhubClient | null) => {
                    const t: any = {};
                    console.log(type)
                    if (type["Schedule"]) type["Schedule"].def.forEach((_type: any) => {
                        t[_type.name] = _type.type;
                    })
                    return ((props) => {
                        const [ c, stores ] = useHub()
                        const [ modalOpen, openModal ] = React.useState<boolean>(false);

                        const [ userData, setData ] = React.useState<object>({});

                          return <>
                        <MutableDialog 
                            open={modalOpen} 
                            onSave={({item} : any) => {
                                if(item.id){
                                    const id = item.id;
                                    if(item.project) item.project = {id: item.project.id};
                                    client?.actions.updateSchedule(id, item).then(() => {
                                        openModal(false)
                                    })
                                }else{

                                    console.log("New schedule", item)
                                 //  client!.realtimeSync?.getArray('Schedule', type['Schedule']).push([item])
                   
                                    openModal(false)

                                    
                                    client?.actions.addSchedule(item).then(() => {
                                        openModal(false)
                                    })
                                }
                            }}
                            onClose={() => {
                                openModal(false);
                                setData({})
                            }}
                            models={client?.models?.map((x: any) => ({
                                ...x,
                                data: stores[x.name]
                            }))}
                            data={userData}
                            structure={t} title={"Schedule"}/>
                        <Calendar events={data.scheduleItems ? data.scheduleItems.map((x:any) => {
                            return {
                                ...x,
                                start: typeof(x.start) === 'string' ? new Date(x.start) : x.start,
                                end: typeof(x.end) === 'string' ? new Date(x.end) : x.end
                            }
                        }) : []} 
                        onDoubleClickEvent={(event: any) => {
                            setData(event)
                            openModal(true)
                        }}
                        onSelectSlot={(slotInfo: any) =>{
                            openModal(true)
                            setData(slotInfo)
                        } } />
                    </>
                    })(data)
                }
            }
        ]
    }