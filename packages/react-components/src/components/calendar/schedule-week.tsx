import React from 'react';
import moment from 'moment';
import TimeGrid from './TimeGrid';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';

import { MoreMenu } from '../more-menu';
import { Popover } from '@material-ui/core';
import { useContext } from 'react';
import { CalendarContext } from '.';
import { StyledCircles as TeamCircles } from '../team-circles';

import { contrast, textToColor } from '../../utils/color'

export const ScheduleEvent = (props: any) => {

  const { actions, user, dispatch } = useContext(CalendarContext)


  const fullName = props.event.project ? `${props.event.project.id}` : '';
  const color = textToColor(fullName)

  const [popper, setPopper] = React.useState<any>(null)

  const showPopper = (anchor?: any) => {
    setPopper(anchor)
  }

  const popperDirection = moment(props.event.end).isoWeekday() > 4 ? 'left' : 'right'

  return (
    <div
      onMouseEnter={(e) => showPopper(e.currentTarget)}
      onMouseLeave={() => {
        showPopper(null)
      }}
      style={{
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {props.event.notes && props.event.notes.filter((a: string) => a.length > 0).length > 0 && (
        <Popover
          style={{ pointerEvents: 'none' }}
          open={Boolean(popper)}
          anchorEl={popper}
          anchorOrigin={{
            vertical: 'center',
            horizontal: popperDirection
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: popperDirection == 'right' ? 'left' : 'right'
          }}
          onClose={() => showPopper(null)}
        >
          <div style={{ padding: 8, background: 'black', color: 'white' }}>
            {(props.event.notes || []).filter((a: string) => a.length > 0).map((x: string) => (
              <>
                {x}
                <br />
              </>
            ))}
          </div>
        </Popover>)}
      <div style={{
        display: 'flex',
        textAlign: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        fontSize: 18,
        backgroundColor: `#${color}`,
        color: contrast(`#${color}`),
        fontWeight: 'bold',
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 4,
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', left: 8 }}>{props.event.project && props.event.project.id}</div>

        <div>
          {props.event.project && props.event.project.name}

        </div>

        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          <MoreMenu size="small" horizontal menu={[
            {
              type: 'update',
              color: 'white',
              icon: <Edit />,
              label: "Edit",
              action: () => {
                dispatch({ type: 'EDIT_CARD', id: props.event.id })
              }
            },
            {
              type: (props.event.managers || []).map((x: any) => x.id).indexOf(user?.sub) > -1 ? 'delete' : '',
              icon: <Delete />,
              label: "Delete",
              color: '#f1682f',
              action: () => {
                dispatch({ type: 'DELETE_CARD', id: props.event.id })
              }
            },
          ].filter((a) => actions.indexOf(a.type) > -1)} />
        </div>

      </div>
      <div style={{ background: '#dfdfdf', paddingBottom: 4, color: 'black', display: 'flex', textAlign: 'center', flexDirection: 'column' }}>
        {Array.isArray(props.event.people) && props.event.people.filter((a: any) => a).map((x: any) => (
          <div>{x.name}</div>
        ))}
        {Array.isArray(props.event.resources) && props.event.resources.length > 0 && <div style={{ fontWeight: 'bold', fontSize: 18, marginTop: 12, marginBottom: 4 }}>Equipment</div>}
        {Array.isArray(props.event.resources) && props.event.resources.filter((a: any) => a).map((x: any) => (
          <div>{x.name}</div>
        ))}
        <div style={{ marginLeft: 8 }}>
          <TeamCircles
            members={props.event.managers || []}
            size={25} />
        </div>
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

  range(date: any): Date[] {
    let start = moment(date).startOf('week');
    let end = moment(start).add(1, 'week')

    let current = start;
    let range: Array<Date> = [];

    while (current.isBefore(end, 'day')) {
      range.push(new Date(current.valueOf()))
      current = current.clone().add(1, 'day')
    }
    return range;
  }

  static navigate(date: any, action: any) {
    switch (action) {
      case 'PREV':
        return new Date(moment(date).add(-1, 'week').valueOf())
      case 'NEXT':
        return new Date(moment(date).add(1, 'week').valueOf())
      default:
        return date;
    }
  }

  render() {
    let range = this.range(this.props.date);
    return (
      <TimeGrid {...this.props} components={{
        ...this.props.components,
        event: ScheduleEvent
      }} showMultiDayTimes range={range} step={24 * 60} />
    )
  }

}

ScheduleWeek.title = (date) => {
  return `Schedule for ${moment(date).format('DD/MM/YYYY')}`
}

export {
  ScheduleWeek
}
