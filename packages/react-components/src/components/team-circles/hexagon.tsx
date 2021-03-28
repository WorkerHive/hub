import React from 'react';
import styled from 'styled-components';

export interface HexagonProps {
    className?: string;
    size?: number;
    color?: string;
}

const BaseHexagon : React.FC<HexagonProps> = (props) => {
    return (
        <div className={`hex ${props.className}`}>
            <div className="text">
                <span>{props.children}</span>
            </div>
        </div>
    )
}


const defaultHeight = 30;


export const Hexagon = styled(BaseHexagon)`
     position: relative;
  margin: 0;
  z-index: 9;
  width: ${props => (props.size || defaultHeight)/ 1.732}px; height: ${props => props.size || defaultHeight}px;
  border-radius: ${props => (props.size || defaultHeight) / 17.23}px/${props => (props.size || defaultHeight) / (17.23 * 2)}px;
  background: ${props => props.color || 'orange'};
  transition: opacity .5s;

  .text span, .text span{
      font-family: "Roboto", sans-serif;
  }

  .text{
      font-size: ${props => (props.size || defaultHeight) / 1.6}px;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      z-index: 9;
  }

  ::before, ::after {
  position: absolute;
  width: inherit; height: inherit;
  border-radius: inherit;
  background: inherit;
  content: '';
}
::before {
    -webkit-transform: rotate(60deg);
  transform: rotate(60deg);
}
::after {
    -webkit-transform: rotate(-60deg);
  transform: rotate(-60deg);
}
`