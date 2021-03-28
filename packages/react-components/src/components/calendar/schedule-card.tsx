import { Typography } from "@material-ui/core"
import React from "react"
import { contrast } from "react-components/src/utils/color"
import styled from "styled-components"
import { MoreMenu, MoreMenuItem } from "../more-menu"
import { StyledCircles as TeamCircles } from '../team-circles'

export interface ScheduleCardProps {
    event: {
        project: {
            id: string,
            name: string
        },
        notes: string[]
        people: Array<{ name: string }>
        resources: Array<{ name: string }>
        managers: Array<{ id: string, name: string }>;
    }
    className?: string;
    color?: string;
    icons?: any;
    actions?: Array<MoreMenuItem>;
}

const BaseScheduleCard: React.FC<ScheduleCardProps> = ({
    className,
    event,
    color,
    icons = {},
    actions = []
}) => {
   
    console.log(icons)
    
    return (
        <div className={className}>
            <div className="schedule-card__header">
                <Typography className="schedule-card__title">
                    {event.project && event.project.name}
                </Typography>
                <Typography className="schedule-card__id">
                    {event.project && event.project.id}
                </Typography>
            </div>
            <div className="schedule-card__body">
                <div className="schedule-card__info">
                    <div>
                        {Array.isArray(event.people) && event.people.length > 0 && <div className="info-header">People</div>}
                        {Array.isArray(event.people) && event.people.filter((a: any) => a).map((x: any) => (
                            <div>{x.name}</div>
                        ))}
                    </div>
                    <div>
                        {Array.isArray(event.resources) && event.resources.length > 0 && <div className="info-header">Equipment</div>}
                        {Array.isArray(event.resources) && event.resources.filter((a: any) => a).map((x: any) => (
                            <div>{x.name}</div>
                        ))}
                    </div>
                </div>

                <div className="actions-container">
                    <MoreMenu square size="small" menu={actions}>

                    </MoreMenu>
                </div>
                
            </div>
            <div className="schedule-card__extras">
                <div style={{ paddingLeft: 8 }}>
                    <TeamCircles
                        members={event.managers || []}
                        size={30} />
                </div>
                <div>
                            {event.notes && event.notes.length > 0 && icons['notes']}
                </div>
            </div>
        </div>
    )
}

export const ScheduleCard = styled(BaseScheduleCard)`
    .schedule-card__extras{
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #e5ddda;
        padding-top: 4px;
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 4px;
    }

    .schedule-card__info{
        flex: 1;
        display: flex;
        flex-wrap: wrap;
    }

    .schedule-card__info > div:not(:last-child){
        margin-right: 8px;
    }

    .schedule-card__info .info-header{
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 4px;
    }

    .schedule-card__body{
        background-color: #e5ddda;
        color: #000;
        display: flex;
        padding-left: 8px;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .schedule-card__body .actions-container svg{ 
        fill: #000;
    }

    .schedule-card__header {
        display: flex;
        text-align: center;
        justify-content: space-between; 
        align-items: center;
        flex-direction: row;
        font-size: 18px;
        background-color: ${props => props.color};
        color: ${props => contrast(props.color)}; 
        font-weight: bold;
        padding: 6px;

        margin-bottom: 4px;
        position: relative;
    }

    .schedule-card__header .MuiTypography-root{
        font-weight: bold;
    }

    .schedule-card__header .schedule-card__title{
        white-space: pre-wrap;
        text-align: left;
        text-overflow: ellipsis;
        line-height: 1.1rem;
        max-height: 2.2rem;
        overflow: hidden;
        word-break: break-word;
    }

    .schedule-card__header .schedule-card__id{
        font-size: 1rem;
        lineHeight: 1.1rem;

    }
`