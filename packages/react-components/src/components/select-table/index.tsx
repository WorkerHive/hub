import React from 'react';

import { Table, TableHead, TableRow, TableCell, Checkbox, TableBody } from '@material-ui/core'
import styled from 'styled-components';
import { isEqual } from 'lodash';

export interface SelectTableProps {
    readonly?: boolean;
    data: any[]
    onChange: any;
    selected: Array<any>;
}

const BaseSelectTable : React.FC<SelectTableProps> = (props) => {

    const onChange = (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
        let ix = props.selected.indexOf(item.id)
        let s = props.selected.slice();
        if (!e.target.checked) {
            s.splice(ix, 1)
        } else {
            s.push(item.id)
        }
        console.log(e.target.checked, s)
        props.onChange(s)
    }

    const sortFn = (a: any, b: any) => {
        if (a.name > b.name) return 1;
        if (b.name > a.name) return -1;
        return 0;
    }

    const allSelected = () => {
        return props.data.length > 0 && props.selected.length > 0 && isEqual(props.selected, props.data.map((x) => x.id))
    }

    const selectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked){
            props.onChange(props.data.map((x) => x.id))
        }else{
            props.onChange([])
        }
    }

    return (
        <Table>
            <TableHead style={{ height: 30, backgroundColor: '#0d7272' }}>
                <TableRow style={{ height: 30 }}>
                    <TableCell padding="checkbox">
                        <Checkbox checked={allSelected()} onChange={(e) => selectAll(e)} style={{ color: '#fff !important' }} color="secondary"></Checkbox>
                    </TableCell>
                    <TableCell padding='none'>
                        Name
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.data.sort(sortFn).map((x, ix) => [
                    <TableRow key={ix} style={{ borderBottom: '2px solid #dfd', height: 30 }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                disabled={props.readonly}
                                checked={props.selected.indexOf(x.id) > -1}
                                onChange={(e) => onChange(e, x)} />
                        </TableCell>
                        <TableCell style={{ color: '#000' }} padding="none">
                            {x.name}

                        </TableCell>
                    </TableRow>
                ])}
            </TableBody>

        </Table>
    )
}

export const SelectTable = styled(BaseSelectTable)`

`