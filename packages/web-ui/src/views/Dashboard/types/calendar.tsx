import { Paper } from "@material-ui/core";
import *  as Y from 'yjs';
import { v4 } from 'uuid';
import { useRealtime, WorkhubClient, useHub } from "@workerhive/client";
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
                component: (data: any, params: any, type: any, client: any) => {

                    const calendar : Y.Array<Y.Map<any>> = client.realtimeSync?.doc.getArray(`schedule-calendar`)

                    const [state, dispatch] = useRealtime(calendar, (state, action) => {
                        //  let p = project.toJSON();
                        console.log(calendar.toJSON(), state, action)

                        switch(action.type){
                            case 'ADD_SCHEDULE':
                                let schedule = {
                                    ...action.item,
                                    start: action.item.start.getTime(),
                                    end: action.item.end.getTime()
                                }
                                let map = new Y.Map<any>();
                                Object.keys(schedule).forEach((x) => {
                                    map.set(x, schedule[x])
                                })
                                calendar.push([map])
                                break;
                            case 'UPDATE_SCHEDULE':
                                let ix = calendar.toJSON().map((x : any) => x.id).indexOf(action.item.id);
                                let item = calendar.get(ix)

                                let sc = {
                                    ...action.item,
                                    start: action.item.start.getTime(),
                                    end: action.item.end.getTime()
                                }
                                Object.keys(sc).forEach((x) => {
                                    item.set(x, sc[x])
                                })
                                break;
                            default:
                                return state;
                        }
                    })

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
                                    console.log("Update")
                                    dispatch({type: 'UPDATE_SCHEDULE', item: item})
                                    openModal(false)
                                  /*  const id = item.id;
                                    if(item.project) item.project = {id: item.project.id};
                                    client?.actions.updateSchedule(id, item).then(() => {
                                        openModal(false)
                                    })*/
                                }else{

                                    console.log("New schedule", item)
                                 //  client!.realtimeSync?.getArray('Schedule', type['Schedule']).push([item])
                                    item.id = v4()
                                    openModal(false)

                                    dispatch({type: 'ADD_SCHEDULE', item: item})
                                 
                                   /* client?.actions.addSchedule(item).then(() => {
                                        openModal(false)
                                    })*/
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
                        <Calendar events={calendar.toJSON().map((x:any) => {
                            return {
                                ...x,
                                start: typeof(x.start) === 'string' || typeof(x.start) === 'number' ? new Date(x.start) : x.start,
                                end: typeof(x.end) === 'string' || typeof(x.end) === 'number' ? new Date(x.end) : x.end
                            }
                        })} 
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
