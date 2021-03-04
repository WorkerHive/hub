import {GraphConnector} from "./GraphConnector";
import { WorkhubFS } from "@workerhive/ipfs"
import MessageQueue from "@workerhive/mq"

export default interface GraphContext {
    connector: GraphConnector;
    fs?: WorkhubFS;
    mq?: MessageQueue;
    user?: any;
    mail?: any;
}