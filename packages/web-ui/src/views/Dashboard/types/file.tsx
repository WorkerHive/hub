import { WorkhubClient } from "@workerhive/client";
import { FileDrop, FileBrowser, Header } from "@workerhive/react-ui";
import React from "react";


export const FILE_VIEW = {
        path: '/dashboard/files',
        label: "Files",
        data: {
            files: {
                type: '[File]',
                query: () => {

                }
            }
        },
        layout: (sizes: any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12, 
                h: 1,
                component: (data: any) => (<Header title="Files" />)
            },
            {
                i: 'data',
                x: 0,
                y: 1,
                w: 12,
                h: (sizes.height / rowHeight) - 1,
                component: (data: any, params: any, types: any, client: any) => {
                    console.log(data)

                    return (
                        <FileBrowser 
                            files={data.files} 
                            onUploadFiles={() => {
                                console.log("Upload files")
                            }}
                            onFileUpload={({files}: any) => {
                                console.log(files);
                                client?.fsLayer?.addFile(files[0]).then((cid : any) => {
                                   // let cid = data.toString();
                                   client?.actions.addFile(files[0].name, cid).then((r: any) => {
                                       console.log("Upload response", r);
                                   });
                                    console.log('Upload file', cid);
                                }) //.actions.addFile(files[0])
                            }} />
                )
                        }
            }
        ]
    }