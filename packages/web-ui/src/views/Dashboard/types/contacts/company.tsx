import { Delete, Edit } from '@material-ui/icons';
import { MutableDialog, SearchTable } from '@workerhive/react-ui';
import React from 'react';

export interface CompanyViewProps {
    client: {
        actions: any;
        crudAccess: (type: string) => string[];
    };
    data: any;
    type: any;
    models: any;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
    client,
    data,
    type,
    models
}) => {

    const [ open, modalOpen ] = React.useState<boolean>(false);
    const [ selected, setSelected ] = React.useState<string>();
    
    return (
        <>
                    <MutableDialog
                models={models}
                title={data.label}
                data={selected}
                structure={type}
                onSave={({ item }: any) => {
                    if (item.id) {
                        const id = item.id;
                        client.actions.updateContactOrganisation(id, item).then(() => {
                            modalOpen(false);
                        })
                    } else {
                        client.actions.addContactOrganisation(item).then(() => {
                            modalOpen(false);
                        })
                    }


                }}
                onClose={() => modalOpen(false)}
                open={open} />
            <SearchTable
                actions={client.crudAccess("Contact")}
                onCreate={() => modalOpen(true)}
                options={[
                    {
                        type: 'update',
                        label: "Edit",
                        color: 'white',
                        icon: <Edit />,
                        action: (item: any) => {
                            setSelected(item)
                            modalOpen(true)

                        }
                    },
                    {
                        type: 'delete',
                        label: "Delete",
                        color: "#f1682f",
                        icon: <Delete />,
                        action: (item: any) => {
                            client.actions.deleteContactOrganisation(item.id)
                        }
                    }
                ]}
                columns={[
                    {
                        label: "Name",
                        key: 'name',
                        flex: 1
                    }
                ]}
                data={data.organisations || []} />
                </>
    )
}