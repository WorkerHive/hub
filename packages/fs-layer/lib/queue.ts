export interface MessageQueue {
    queue: (queue: string, blob: object) => boolean
    watch: (queue: string, fn: Function) => any
}