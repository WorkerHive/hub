export declare global {
    interface Window { 
        layout_polls : Array<NodeJS.Timeout>
        __TAURI__: any;
    }
}