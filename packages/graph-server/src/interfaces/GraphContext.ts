import {GraphConnector} from "./GraphConnector";
import { WorkhubFS } from "@workerhive/ipfs"

export default interface GraphContext {
    connector: GraphConnector;
    fs?: WorkhubFS;
    user?: any;
}