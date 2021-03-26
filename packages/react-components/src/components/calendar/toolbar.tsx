import { ButtonGroup, Button, IconButton } from '@material-ui/core';
import {
    ArrowLeft,
    ArrowRight
} from "@material-ui/icons"
import styled from 'styled-components';
import React from 'react';
import moment from 'moment';

const ToolbarHeader = (props: any) => {
    console.log(props)

    const _next = () => {
        let d = moment(props.date)
        return new Date(d.valueOf())
    }
    
    const _prev = () => {
        let d = moment(props.date)
        return new Date(d.valueOf())
    }

    const _label = () => {
        let startOfWeek = moment(props.date).startOf('isoWeek')
        let endOfWeek = moment(props.date).endOf('isoWeek')

        return `${startOfWeek.format('DD/MM/YY')} - ${endOfWeek.format('DD/MM/YY')}`
    }

    return (
        <div className={props.className}>
            <div className="controls">
                <IconButton 
                    size="small"
                    onClick={props.onNavigate.bind(null, 'PREV', _prev())}>
                    <ArrowLeft />
                </IconButton>
                <div className="current">{_label()}</div>
                <IconButton 
                    size="small"
                    onClick={props.onNavigate.bind(null, 'NEXT', _next())}>
                    <ArrowRight /> 
                </IconButton>
            </div>
            <div className="views">
                <ButtonGroup size="small">
                    {[/*{
                        disabled: true,
                        type: 'month',
                        label: "Month View"
                    }, */ {
                        disabled: false,
                        type: 'work_week',
                        label: 'Week View'
                    }].map((item) => (
                        <Button disabled={item.disabled} className={item.type == props.view ? 'active' : ''} variant="contained">
                            {item.label}
                       </Button>
                    ))}
                </ButtonGroup>
            </div>
                
        </div>
    )
}

export const StyledToolbar = styled(ToolbarHeader)`
    display: flex;
    justify-content: space-between;

    padding: 8px;

    .controls {
        display: flex;
        align-items: center;
        color: #e4bc71;
    }

    .controls .current {
        font-size: 17px;
        font-weight: bold;
    }

    .views button {
        background: transparent;
        border: 2px solid #e4bc71;
        font-weight: bold;
        color: #e4bc71;
    }

    .views button.active{
        background: #e4bc71;
        color: #0b7272;
    }


    svg{
        fill: #e4bc71;
        width: 30px;
        height: 30px;
    }
`

export const Toolbar = (props: any) => {
    return (
        <StyledToolbar {...props} />
    )
}