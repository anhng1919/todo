import getStorage from '../utils/getStorage';
import getPubSub from '../utils/getPubSub';
import {GraphQLScalarType} from 'graphql';
import {v4 as generateUuid} from 'uuid';

// Create Storage instance
const storage = getStorage();

// Create pubsub instance
const pubsub = getPubSub();


// Resolvers
export default {
  // Root resolver: Query
  Query: {
    // tasks resolver
    tasks: (root, args, context, info) => {
      // getting tasks from storage
      return storage.get('tasks')
    },
  },

  // DateTime type
  DateTime:  new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime type',
    serialize(value) {
      let result = value.toString()

      return result
    },
    parseValue(value) {
      let result = new Date(value)
      return result;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null;
    }
  }),


  // Root resolver: Mutation
  Mutation: {
    // wrtiteANewTask resolver
    writeANewTask: (root, args, context, info) => {
      // creating a new task from args
      const {name} = args
      const newTask = {
        uuid: generateUuid(),
        name,
        createdAt: new Date()
      }

      // get current tasks
      const tasks = storage.get('tasks')

      // persist new task
      tasks.push(newTask)
      storage.set('tasks', tasks)

      // send TASK_WAS_NOTED event to pubsub
      pubsub.publish('TASK_WAS_NOTED', {
        taskWasNoted: newTask
      })
      return true;
    }
  },


  // Root resolver: Subscription
  Subscription: {
    // taskWasNoted resolver
    taskWasNoted: {
      // connect to a pubsub iterator
      subscribe: () => pubsub.asyncIterator(['TASK_WAS_NOTED']),
    }
  }
};