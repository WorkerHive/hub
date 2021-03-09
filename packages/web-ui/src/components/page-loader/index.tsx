import React from 'react';
import { Typography } from '@material-ui/core'
import SyncLoader from 'react-spinners/SyncLoader';
import styled from 'styled-components'

export interface PageLoaderProps{
    text?: string;
    className?: string;
    size?: number;
}

export const Loader : React.FC<PageLoaderProps> = ({
    size = 40,
    className,
    text
}) => {
    return (
        <div className={className}>
            <SyncLoader color='#079692' loading size={size} />
            {text && <Typography variant="h6" style={{marginTop: 12, color: "#079692"}}>{text}</Typography>}
        </div>
    )
}

export const PageLoader = styled(Loader)`
    display: flex; 
    flex: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`