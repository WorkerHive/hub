import React from 'react';
import moment from 'moment';
import TimeGrid from './TimeGrid';

export const ScheduleEvent = (props : any) => {
  console.log("Event", props.event)
  return (
    <div style={{paddingTop: 4, display: 'flex', flexDirection: 'column'}}>
      <div style={{
          display: 'flex',
          textAlign: 'center', 
          flexDirection: 'column', 
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 4
      }}>
         {props.event.project.id.length < 8 ? `${props.event.project.id} - ` : ''}
         {props.event.project && props.event.project.name}
      </div>
      <div style={{display: 'flex', textAlign: 'center', flexDirection: 'column'}}>
        {Array.isArray(props.event.people) && props.event.people.map((x: any) => (
          <div>{x.name}</div>
         ))}
         <hr />
        {Array.isArray(props.event.resources) && props.event.resources.map((x: any) => (
          <div>{x.name}</div>
        ))}
      </div>
    </div>
  )
}

export interface ScheduleWeekProps {
  date: Date
  events: any
  getNow: any
  accessors: any
  getters: any
  components: any
  localizer: any
  getDrilldownView: any
}

class ScheduleWeek extends React.Component<ScheduleWeekProps, {}> {
  static title: (date: any) => string;

  range(date : any) : Date[] {
    let start = moment(date).startOf('week');
    let end = moment(start).add(1, 'week')

    let current = start;
    let range : Array<Date> = [];

    while(current.isBefore(end, 'day')){
      range.push(new Date(current.valueOf()))
      current = current.clone().add(1, 'day')
    }
    return range;
  }

  static navigate(date : any, action : any){
    switch(action){
      case 'PREV':
        return new Date(moment(date).add(-1, 'week').valueOf())
      case 'NEXT':
        return new Date(moment(date).add(1, 'week').valueOf())
      default:
        return date;
    }
  }

  render(){
    console.log("Events: ", this.props.events);
    let range = this.range(this.props.date);
    return (
       <TimeGrid {...this.props} components={{
         ...this.props.components,
         event: ScheduleEvent
        }} showMultiDayTimes range={range} step={24 * 60}/>
    )
  }

}

ScheduleWeek.title = (date) => {
  return `Schedule for ${moment(date).format('DD/MM/YYYY')}`
}

export {
   ScheduleWeek
}
