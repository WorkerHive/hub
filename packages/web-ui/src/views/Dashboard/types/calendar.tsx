import { Paper } from "@material-ui/core";
import *  as Y from 'yjs';
import { v4 } from 'uuid';
import { useRealtime, WorkhubClient, useHub } from "@workerhive/client";
import { Calendar, Header, MutableDialog } from "@workerhive/react-ui";
import CalendarDialog from '../../../components/calendar-dialog';
import React from "react";
import { ReactComponent as CommentsIcon } from '../../../assets/comments-hex.svg';
export const CALENDAR_VIEW = {
    path: '/dashboard',
    label: "Calendar",
    data: {
        projects: {
            type: '[Project]'
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


                const calendar: Y.Array<Y.Map<any>> = client.realtimeSync?.doc.getArray(`schedule-calendar`)

                const [state, dispatch] = useRealtime(calendar, (state, action) => {
                    //  let p = project.toJSON();


                    switch (action.type) {
                        case 'ADD_SCHEDULE':
                            console.log(action.item)
                            let schedule = {
                                ...action.item,
                                managers: [{id: client.user.sub, name: client.user.name}],
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
                            let ix = calendar.toJSON().map((x: any) => x.id).indexOf(action.item.id);
                            let item = calendar.get(ix)

                            let start_date = typeof(action.item.start) === 'number' ? action.item.start : action.item.start.getTime(); 
                            let end_date = typeof(action.item.end) === 'number' ? action.item.end : action.item.end.getTime();

                            console.log(action.item)
                            let sc = {
                                ...action.item,
                                start: start_date,
                                end: end_date 
                            }
                            Object.keys(sc).forEach((x) => {
                                item.set(x, sc[x])
                            })
                            break;
                        case 'REMOVE_SCHEDULE_ITEM':
                            console.log("Remove schedule item", calendar.toArray())
                            let r_ix = calendar.toArray().map((x: any) => x.toJSON().id).indexOf(action.id);
                            console.log("IX", r_ix)
                            calendar.delete(r_ix)

                            return calendar.toArray();
                        default:
                            return state;
                    }
                })

                const t: any = {};

                if (type["Schedule"]) type["Schedule"].def.forEach((_type: any) => {
                    t[_type.name] = _type.type;
                })

                const calendarParse = (item: any) => {
                    if (item.project && Object.keys(item.project).length == 1) {
                        let p = data.projects.find((a: any) => a.id == item.project.id)
                        item.project = p || item.project
                    }

                    if (item.people && item.people.id && Object.keys(item.people).length == 1) {
                        let people = item.people.id.map((x: string) => data.people.find((a: any) => a.id == x))
                        item.people = people.filter((a: any) => a != undefined).length > 0 ? people : item.people;
                    }
                    if (item.resources && item.resources.id && Object.keys(item.resources).length == 1) {
                        let eqpt = item.resources.id.map((x: string) => data.equipment.find((a: any) => a.id == x))
                        item.resources = eqpt.filter((a: any) => a != undefined).length > 0 ? eqpt : item.resources;
                    }
                    return {
                        ...item,
                        start: typeof (item.start) === 'string' || typeof (item.start) === 'number' ? new Date(item.start) : item.start,
                        end: typeof (item.end) === 'string' || typeof (item.end) === 'number' ? new Date(item.end) : item.end
                    }
                }

                return ((props) => {
                    const [c, stores] = useHub()
                    const [modalOpen, openModal] = React.useState<boolean>(false);

                    const [ selectedSlots, setSelectedSlots ] = React.useState<{start: Date, end: Date}>();

                    const [userData, setData] = React.useState<Y.Map<any>>();

                    const actions = [
                                    "create", 
                                    "read", 
                                    "update", 
                                    "delete"
                                ].filter((a) => client?.canAccess("Schedule", a))

                    const closeModal = () => {
                        openModal(false);
                        setData(undefined)
                        setSelectedSlots(undefined)
                    }

                    return <>
                        <CalendarDialog
                            actions={actions}
                            slots={selectedSlots}
                            data={userData}
                            projects={data.projects}
                            team={data.people}
                            equipment={data.equipment}
                            open={modalOpen}
                            onDelete={() => {
                                dispatch({type: 'REMOVE_SCHEDULE_ITEM', id: userData?.get('id')})
                                closeModal();
                            }}
                            onSave={(data: any) => {
                                if (data.id) {
                                    dispatch({ type: 'UPDATE_SCHEDULE', item: data })
                                } else {
                                    data.id = v4()
                                    dispatch({ type: 'ADD_SCHEDULE', item: data })
                                }
                              
                                closeModal();
                            }}
                            onClose={closeModal}
                        />

                        <Calendar
                            icons={{notes:  <CommentsIcon style={{height: 26, fill: '#079692'}} />}}
                            actions={actions}
                            user={client?.user}
                            events={calendar.toJSON().map(calendarParse)}
                            onDeleteEvent={(event: any) => {
                                dispatch({ type: 'REMOVE_SCHEDULE_ITEM', id: event.id })
                            }}
                            onDoubleClickEvent={(event: any) => {
                                let ix = calendar.toJSON().map((x: any) => x.id).indexOf(event.id);
                                setData(calendar.get(ix))
                                console.log(calendar.get(ix).toJSON())
                                openModal(true)
                            }}
                            onSelectSlot={(slotInfo: any) => {
                                setSelectedSlots(slotInfo)
                                openModal(true)
                            }} />
                    </>
                })(data)
            }
        }
    ]
}
