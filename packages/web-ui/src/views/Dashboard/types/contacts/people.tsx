import React from 'react';
import { Delete, Edit } from "@material-ui/icons";
import { MSContactCard } from "@workerhive/parsers";
import { FileDrop, MutableDialog, SearchTable } from "@workerhive/react-ui";

export interface PeopleProps {
    client: {
        actions: any;
        crudAccess: (type: string) => string[];
    },
    models: any;
    data: any;
    type: any;
    history?: any;
}
export const PeopleView: React.FC<PeopleProps> = ({
    client,
    models,
    data,
    type
}) => {

    const [open, modalOpen] = React.useState<boolean>(false);
    const [ selected, setSelected ] = React.useState<any>();

    return (
        <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            <MutableDialog
                models={models}
                title={data.label}
                data={selected}
                structure={type}
                onSave={({ item }: any) => {
                    if (item.id) {
                        const id = item.id;
                        client.actions.updateContact(id, item).then(() => {
                            modalOpen(false);
                        })
                    } else {
                        client.actions.addContact(item).then(() => {
                            modalOpen(false);
                        })
                    }


                }}
                onClose={() => modalOpen(false)}
                open={open} />
            <FileDrop accept={[".contact"]} noClick onDrop={({ files }) => {
                if (files.length == 1) {
                    var fr = new FileReader();
                    fr.onload = (e) => {
                        let data = e.target?.result;
                        if (data) {
                            let contact = new MSContactCard(data.toString());

                            setSelected({
                                name: contact?.names && contact?.names[0].formattedName,
                                email: contact?.emails && contact?.emails[0].address
                            })

                            modalOpen(true);

                            console.log("Contact", contact)
                        }
                    }

                    fr.readAsText(files[0])
                }
                console.log("Contact files", files)
            }}>
                {(isDragActive: boolean) => (
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
                                    client.actions.deleteContact(item.id)
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
                        data={data.contacts || []} />
                )}
            </FileDrop>

        </div>
    )
}