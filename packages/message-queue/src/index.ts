import amqplib from 'amqplib'

export interface MessageQueueOpts{
    host: string;
}

export default class MessageQueue {

    private connection? : amqplib.Connection;
    private channel? : amqplib.Channel

    constructor(opts : MessageQueueOpts){
        amqplib.connect(opts.host).then((connection) => {
            this.connection = connection
            this.connection.createChannel().then((channel) => {
                this.channel = channel
            })
        });
    }

    async queue(queue: string, blob: object){
        await this.channel?.assertQueue(queue)
        return this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(blob)))
    }

    async watch(queue: string, fn: Function){
        await this.channel?.assertQueue(queue)
        return this.channel?.consume(queue, async (msg) => {
            if(msg !== null){
                try{
                    let result = await fn(JSON.parse(msg.content.toString()))
                    if(result) this.channel?.ack(msg)
                    if(!result) this.channel?.nack(msg)
                }catch(e){
                    this.channel?.nack(msg)
                }
            }
        })
    }


}