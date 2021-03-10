import amqplib from 'amqplib'

export interface MessageQueueOpts{
    host: string;
    ready: Function
}

export default class MessageQueue {

    private connection? : amqplib.Connection;
    private channel? : amqplib.Channel

    constructor(opts : MessageQueueOpts){
        amqplib.connect(opts.host).then((connection) => {
            console.log("Connected to MQ")
            this.connection = connection
            this.connection.createChannel().then((channel) => {
                this.channel = channel
                opts.ready()
            })
        });
    }

    async queue(queue: string, blob: object){
        console.log("Send to Queue", queue, blob)
        await this.channel?.assertQueue(queue)
        return this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(blob)))
    }

    async watch(queue: string, fn: Function){
        await this.channel?.assertQueue(queue)
        return this.channel?.consume(queue, async (msg) => {
            console.log("MSG", msg)
            if(msg !== null){
                try{
                    let result = await fn(JSON.parse(msg.content.toString()))
                    console.log("Pinning result", result)
                    if(result) this.channel?.ack(msg)
                    if(!result) this.channel?.nack(msg)
                }catch(e){
                    console.log("Error pinning file", e)
                    this.channel?.nack(msg)
                }
            }
        })
    }


}