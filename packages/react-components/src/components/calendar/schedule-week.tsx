import React from 'react';
import moment from 'moment';
import TimeGrid from './TimeGrid';
import { Delete, Edit } from '@material-ui/icons';
import { MoreMenu } from '../more-menu';

const invert = require('invert-color');

export const ScheduleEvent = (props : any) => {
  
  function hashCode(str: string) { // java String#hashCode
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  } 

  function intToRGB(i: number){
      var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();

      return "00000".substring(0, 6 - c.length) + c;
  }

  const fullName = props.event.project && `${props.event.project.id}-${props.event.project.name}`;
  const color = intToRGB(hashCode(fullName))

  console.log("Event card props", props);

  return (
    <div style={{borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      <div style={{
          display: 'flex',
          textAlign: 'center', 
          justifyContent: 'center',
          flexDirection: 'row', 
          fontSize: 18,
          backgroundColor: `#${color}`,
          color: invert(`#${color}`),
          fontWeight: 'bold',
          paddingTop: 4,
          paddingBottom: 4,
          marginBottom: 4,
          position: 'relative'
      }}>
        <div>
          {props.event.project.id.length < 8 ? `${props.event.project.id} - ` : ''}
         {props.event.project && props.event.project.name}

        </div>

        <div style={{position: 'absolute', right: 0, top: 0 }}>
          <MoreMenu size="small" horizontal menu={[
            {icon: <Edit />, label: "Edit"},
            {icon: <Delete />, label: "Delete", color: 'red'},
          ]} />
        </div>

      </div>
      <div style={{background: '#dfdfdf', paddingBottom: 4, color: 'black', display: 'flex', textAlign: 'center', flexDirection: 'column'}}>
        {Array.isArray(props.event.people) && props.event.people.map((x: any) => (
          <div>{x.name}</div>
         ))}
        <div style={{fontWeight: 'bold', fontSize: 18, marginTop: 12, marginBottom: 4}}>Equipment</div>
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
