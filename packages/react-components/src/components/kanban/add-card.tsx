import { Add } from '@material-ui/icons';
import styled from 'styled-components'
import React from 'react';

export const AddCard = styled((props : any) => {
    return (
        <a className={props.className} onClick={props.onClick}>
            <Add style={{marginRight: 8}}/>
            <span>
                Add Card
            </span>
        </a>
    )
})`

margin: 2px 8px 8px 8px;
padding: 4px 8px;
border-radius: 3px;
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
position: absolute;
bottom: 0px;
left: 0px;
right: 0px;

:hover{
    color: #172b4d;
    background: rgba(9,30,66,.08);
}

`