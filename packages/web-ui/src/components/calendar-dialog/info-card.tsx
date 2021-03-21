import { TextField, Typography } from '@material-ui/core';
import React from 'react';

export interface InfoCardProps {
    description: string;
    onChange: (description: string) => void;
    readonly?: boolean;
}

const InfoCard : React.FC<InfoCardProps> = (props) => {
    return (
<>
        <TextField 
            disabled={props.readonly}
            value={props.description}
            onChange={(e) => props.onChange(e.target.value)}
            fullWidth
            label="Description"
            multiline
            rows={6}
            rowsMax={8} />
    </>
    )
}

export default InfoCard