/*

    WorkerHive Tab View

    Vertical tab list that flows into tab body

*/

import React from 'react';
import styled from 'styled-components';

export interface TabInterface {
    icon?: any;
    label?: any;
    view?: any;
}

export interface TabViewProps {
    tabs?: Array<TabInterface>
    selected?: number;
    className?: string;
    curve?: 10 | 20;
    iconSize?: number;
    color?: string;
    onClick?: (tab: TabInterface, index: number) => void;
}

const BaseWires = (props: any) => {
    return (
        <div className={`wires ${props.className}`}>
            <div className="wire-container">
                <div className="wire-short">
                    <div className="wire-connector"></div>
                </div>
                <div className="wire-long">
                    <div className="wire-connector"></div>
                </div>
                <div className="wire-short">
                    <div className="wire-connector"></div>
                </div>
            </div>
        </div>
    )
}

export const Wires = styled(BaseWires)`
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;

    .wire-container{
        height: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    

    .wire-short, .wire-long{
        position: relative;
        height: 2px;
        right: -5px;
        width: 100%;
        background-color: #0d7272;
    }

    .wire-short{
        width: 80%;
    }

    .wire-connector{
        position: absolute;
        right: 0;
        top: -2px;
        width: 6px;
        height: 6px;
        border-radius: 6px;
        background-color: #0d7272;
    }
`

export const BaseTabView : React.FC<TabViewProps> = ({
    className,
    tabs = [],
    selected,
    onClick = () => {}
}) => {

    const renderActive = () => {
        console.log(tabs, selected)
        if(selected != null && selected > -1){
            console.log("Active tab", tabs[selected].label)

            return tabs[selected].view;
        }
    }

    return (
        <div className={className}>
            <div className="tab-menu">
                {tabs.map((tab, ix) => (
                    <div onClick={onClick.bind(this, tab, ix)} className={`tab-menu__item ${ix == selected ? 'selected': ''}`}>
                        {tab.icon || tab.label}
                        {ix == selected && <Wires />}
                    </div>
                ))}
            </div>
            <div className="tab-body">
                {renderActive()}
            </div>
        </div>
    )
}

export const TabView = styled(BaseTabView)`
flex: 1;
display: flex;

.tab-body{
    min-height: ${props => ((props.tabs || []).length + 1)* (props.iconSize || 55)}px;
    flex: 1;
    background-color: #e5ddda;
    z-index: 99;
    border-radius: 7px;
    border: 2px solid ${props => props.color || '#0d7272'};
    overflow-y: auto;
}

.tab-menu{
    min-height: ${props => ((props.tabs || []).length + 1)* (props.iconSize || 50)}px;
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.tab-menu .tab-menu__item {
    position: relative;
    cursor: pointer;
    height: ${props => props.iconSize || 55}px;
    margin-top:4px;
    margin-bottom: 4px;

    padding-left: 16px;
    padding-right: 16px;
    margin-right: -3px;
}

.tab-menu__item .wires{
    right:0;
    bottom: 0;
    top: 0;
    width: 30px;
}

.tab-menu .tab-menu__item > svg{
    z-index: 9;
    height: ${props => props.iconSize || 55}px;
}

.tab-menu .tab-menu__item.selected{
    z-index: 100;
    border-right: 3px solid #e5ddda;
}

.tab-menu .tab-menu__item.selected::after, .tab-menu .tab-menu__item.selected::before{
    z-index: -1;
    pointer-events: none;
    right: 0px;
    width: 26px;
    height: 18px;
    border: 2px solid ${props => props.color || '#0d7272'};
    border-left-color: transparent;
    position: absolute;
    content: "";
}

.tab-menu .tab-menu__item.selected::before{
    border-top-color: transparent;
    border-bottom-right-radius: ${props => props.curve || 10}px;
    right: -2px;
    top: -12px;
}

.tab-menu .tab-menu__item.selected::after{
    border-bottom-color: transparent;
    border-top-right-radius: ${props => props.curve || 10}px;
    right: -2px;
    bottom: -12px;
}
`

/*
    Filled
    ---
    background: transparent;
    box-shadow: 20px 0 0 0 #079692;


    Outlined
*/