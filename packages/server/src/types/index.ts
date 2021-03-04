import lodash from 'lodash';

import { 
  typeDef as Layout
} from './layout'

import { 
  typeDef as Project,
  resolvers as projectResolvers
} from './project';

import {
  typeDef as Team,
  resolvers as teamResolvers
} from './team';

import {
  typeDef as Equipment,
} from './equipment'

import {
  typeDef as Calendar,
} from './calendar';

import {
  typeDef as File,
  resolvers as fileResolvers
} from './file'

import {
  typeDef as User,
  resolvers as userResolvers
} from './user';

import {
  typeDef as Knowledge
} from './knowledge'

import {
  typeDef as Integrations,
  resolvers as integrationResolvers
} from './integrations';

import {
  typeDef as Contacts
} from './contact'

const { merge } = lodash;


export const resolvers = merge(teamResolvers, projectResolvers, fileResolvers, userResolvers, integrationResolvers)
export const typeDefs = [Layout, Contacts, Knowledge, Project, Team, Equipment, File, User, Integrations, Calendar].join('\n')
