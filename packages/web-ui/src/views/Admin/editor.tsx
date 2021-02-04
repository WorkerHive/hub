import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core"
import { useHub } from "@workerhive/client";
import { Editor, NodePanel, useEditor } from "@workerhive/hive-flow"
import React from "react"

export interface EditorProps {
    selected?: any;
    onClose: (e : any) => void;
}

export const AdminEditor: React.FC<EditorProps> = (props) => {
    const editor = useEditor();
    const [ client, stores ] = useHub();

    //const [ Modal, setModal ] = React.useState<any>();
    const [ modalOpen, openModal ] = React.useState<boolean>(false);
    
    const Modal = props.selected && props.selected.type && props.selected.type.modal;

    return (
        <>
         <Dialog fullWidth open={props.selected != null} onClose={props.onClose}>
                {Modal != null && <Modal node={editor.nodes.find((a: any) => a.id === props.selected.id)} editor={editor} client={client} onClose={props.onClose} />}
            </Dialog>
                <Editor />
                <NodePanel />
        </>
    )
}