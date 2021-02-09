import React from 'react';

import {Calendar as BigCalendar, momentLocalizer, stringOrDate} from 'react-big-calendar';

import styled from 'styled-components'
import moment, { Moment } from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ScheduleWeek } from './schedule-week';
import { Paper } from '@material-ui/core';

const localizer = momentLocalizer(moment)

export enum CALENDAR_VIEWS {
  WORK_WEEK = 'work_week',
  WEEK = 'week',
  SCHEDULE = 'work_week'
}

export interface CalendarEvent{
  start: Date | Moment ;
  end: Date | Moment;
  title: string;
  allDay?: boolean;
  resource?: any
}

export interface CalendarProps{
  className?: string;
  events?: Array<CalendarEvent>
  viewDate?: Date
  defaultView?: "month" | "week" | "work_week" | "day" | "agenda" | undefined
  onSelectSlot?: (slotInfo: {
    start: stringOrDate,
    end: stringOrDate,
    slots: Array<Date | string>,
    action: "select" | "click" | "doubleClick"
  }) => void
  onSelectEvent?: (event: object, syntheticEvent?: any) => void
  onDoubleClickEvent?: (event: object, syntheticEvent?: any) => void
}

export const WorkhubCalendar : React.FC<CalendarProps> = ({
  className,
  events = [],
  defaultView = CALENDAR_VIEWS.SCHEDULE,
  viewDate = new Date(),
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent
}) => {


  return (
    <Paper className={className}>
      <BigCalendar
        views={{
          month: true,
          week: true,
          work_week: ScheduleWeek
        }}
        onSelectEvent={onSelectEvent}
        onDoubleClickEvent={onDoubleClickEvent}
        onSelectSlot={(slotInfo: {start: stringOrDate, end:stringOrDate, slots: Array<Date | string>, action: "select" | "click" | "doubleClick"}) => {
          slotInfo.start = moment(slotInfo.start).add(12, 'hours').toDate()
          slotInfo.end = moment(slotInfo.end).add(1, 'day').toDate();
          if(onSelectSlot) onSelectSlot(slotInfo)
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
  )
}

export const StyledCalendar = styled(WorkhubCalendar)`
  display: flex;
  flex: 1;
  padding: 4px;
  flex-direction: column;
  position: relative;

  .rbc-time-schedule .rbc-time-header{
    flex: 1;
  }

  .rbc-time-schedule .rbc-event {
    margin-top: 4px;
  }

`
