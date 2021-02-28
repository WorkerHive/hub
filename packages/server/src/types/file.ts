import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

export const typeDef = `
  extend type Mutation {
    connectNode(nodeKey: String): NodeConfiguration
  }

  type NodeConfiguration{
    swarmKey: String
    peerId: String
    peerDiscovery: String
  }

  type FileUploadResult {
    error: String
    duplicate: Boolean
    file: File
  }

 

  type File @upload @configurable{
    id: ID
    cid: String
    filename: String
    extension: String
  }

`

export const resolvers = {
    
    Mutation: {
      connectNode: async (parent, args, context) => {
        return {
          swarmKey: context.connections.files.swarmKey,
          peerId: context.connections.files.id,
          peerDiscovery: process.env.WORKHUB_DOMAIN
        }
      },
    }
}
