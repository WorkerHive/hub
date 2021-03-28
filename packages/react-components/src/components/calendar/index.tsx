import React from 'react';

import {Calendar as BigCalendar, momentLocalizer, stringOrDate} from 'react-big-calendar';

import styled from 'styled-components'
import moment, { Moment } from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ScheduleWeek } from './schedule-week';
import { Paper } from '@material-ui/core';
import { Toolbar } from './toolbar';


const localizer = momentLocalizer(moment)

export enum CALENDAR_VIEWS {
  WORK_WEEK = 'work_week',
  WEEK = 'week',
  SCHEDULE = 'work_week'
}

export interface CalendarEvent{
  id: string;
  start: Date | Moment ;
  end: Date | Moment;
  title: string;
  allDay?: boolean;
  resource?: any
}

export interface CalendarUser {
  sub: string;
  name: string;
}

export interface CalendarProps{
  className?: string;
  user?: CalendarUser;
  events?: Array<CalendarEvent>
  viewDate?: Date
  defaultView?: "month" | "week" | "work_week" | "day" | "agenda" | undefined
  icons?: any;
  onSelectSlot?: (slotInfo: {
    start: stringOrDate,
    end: stringOrDate,
    slots: Array<Date | string>,
    action: "select" | "click" | "doubleClick"
  }) => void
  actions?: Array<string>;
  onDeleteEvent?: (event: object) => void;
  onSelectEvent?: (event: object, syntheticEvent?: any) => void
  onDoubleClickEvent?: (event: object, syntheticEvent?: any) => void
}

export const CalendarContext = React.createContext<{
  user: CalendarUser | undefined, 
  icons: any,
  actions: string[], 
  dispatch: any | null
}>({dispatch: null, user: undefined, icons: {}, actions: []});


export const WorkhubCalendar : React.FC<CalendarProps> = ({
  className,
  events = [],
  user,
  icons = {},
  actions = ["create", "read", "update", "delete"],
  defaultView = CALENDAR_VIEWS.SCHEDULE,
  viewDate = new Date(),
  onSelectSlot,
  onSelectEvent,
  onDeleteEvent,
  onDoubleClickEvent
}) => {

  const dispatch = (action : {type: string, id: string}) => {
    let e = events.find((a) => a.id == action.id)

    switch(action.type){
      case 'DELETE_CARD':
        if(e && onDeleteEvent && (actions.indexOf("delete") > -1)) onDeleteEvent(e)
        console.log("Delete", action, e)
        break;
      case 'EDIT_CARD':
        if(e && onDoubleClickEvent && (actions.indexOf("read") > -1 || actions.indexOf("update") > -1)  ) onDoubleClickEvent(e)
        console.log("Edit", action, e)
        break;
    }
  }

  return (
    <CalendarContext.Provider value={{icons, user, actions, dispatch}}>
    <Paper className={className}>
      <BigCalendar
        views={{
          month: true,
          week: true,
          work_week: ScheduleWeek
        }}
        components={{
          toolbar: Toolbar 
        }}
        onSelectEvent={onSelectEvent}
        onDoubleClickEvent={(actions.indexOf("read") > -1 || actions.indexOf("update") > -1) ? onDoubleClickEvent : undefined}
        onSelectSlot={(slotInfo: {start: stringOrDate, end:stringOrDate, slots: Array<Date | string>, action: "select" | "click" | "doubleClick"}) => {
          slotInfo.start = moment(slotInfo.start).add(12, 'hours').toDate()
          slotInfo.end = moment(slotInfo.end).add(1, 'day').toDate();
          if(onSelectSlot && actions.indexOf("create") > -1) onSelectSlot(slotInfo)
        }}
        selectable={true}
        defaultDate={viewDate}
        defaultView={defaultView}
        localizer={localizer}
        events={events}
        allDayAccessor={(event: any) => event.all_day !== false}
        startAccessor={(event: any) => event.start}
        endAccessor={(event : any) => event.end}
         />
    </Paper>
    </CalendarContext.Provider>
  )
}

export const StyledCalendar = styled(WorkhubCalendar)`
  display: flex;
  flex: 1;
  padding: 8px;
  flex-direction: column;
  position: relative;
  height: 100%;
  background-color: #0b7272 !important;
  border-radius: 12px !important;

  .rbc-time-view, .rbc-time-header-content{
    border: none;
  }

  .rbc-time-header-gutter{
    padding: 0;
  }

  .rbc-calendar .rbc-header:not(:first-child){
    margin-left: 2px;
  }

  .rbc-calendar .rbc-header:not(:last-child){
    margin-right: 2px;
  }

  .rbc-calendar .rbc-header{
    background-color: #e4bc71;
    color: #0b7272;
    padding-top: 4px;
    padding-bottom: 4px;
    font-size: 22px;
    border: none;

    border-top-right-radius: 30px;
    border-top-left-radius: 7px;
  }

  .rbc-day-bg.rbc-selected-cell{
    opacity: 0.6 !important;
  }

  .rbc-day-bg{
    background-color: #168b88;
    border-color: #157575 !important;
    border-width: 4px !important;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .rbc-day-bg.rbc-today, .rbc-day-bg.rbc-today{
    filter: brightness(111%);

  }


  .rbc-calendar, .rbc-time-header{
    height: 100%;
  }

  .rbc-allday-cell{
    overflow-y: auto;
  }

  .rbc-time-schedule .rbc-time-header{
    flex: 1;
  }


  .rbc-time-schedule .rbc-event {
    margin-top: 4px;
    padding: 0;
    border-radius: 12px;
  }

`
