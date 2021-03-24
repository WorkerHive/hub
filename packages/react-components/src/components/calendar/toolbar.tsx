import { ButtonGroup, Button, IconButton } from '@material-ui/core';
import {
    ArrowLeft,
    ArrowRight
} from "@material-ui/icons"
import styled from 'styled-components';
import React from 'react';

const ToolbarHeader = (props: any) => {
    console.log(props)
    return (
        <div className={props.className}>
            <div className="controls">
                <IconButton 
                    size="small"
                    onClick={props.onNavigate.bind(this, 'PREV')}>
                    <ArrowLeft />
                </IconButton>
                <div>{props.label}</div>
                <IconButton 
                    size="small"
                    onClick={props.onNavigate.bind(this, 'NEXT')}>
                    <ArrowRight /> 
                </IconButton>
            </div>
            <div className="views">
                <ButtonGroup size="small">
                    {[{
                        type: 'month',
                        label: "Month View"
                    }, {
                        type: 'work_week',
                        label: 'Week View'
                    }].map((item) => (
                        <Button className={item.type == props.view ? 'active' : ''} variant="contained">
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