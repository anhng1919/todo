import getStorage from '../utils/getStorage';
import getPubSub from '../utils/getPubSub';
import {GraphQLScalarType} from 'graphql';
import {v4 as generateUuid} from 'uuid';

// Create Storage instance
const storage = getStorage();

// Create pubsub instance
const pubsub = getPubSub();

// const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

// Resolvers
export default {
  // Root resolver: Query
  Query: {
    // tasks resolver
    tasks: (root, args, context, info) => {
      // getting tasks from storage
      // await delay(3)
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
        createdAt: new Date(),
        isFinished: false
      }

      // get current tasks
      const tasks = storage.get('tasks')

      // persist new task
      newTask.position = tasks.length
      tasks.push(newTask)
      storage.set('tasks', tasks)

      // send TASK_WAS_NOTED event to pubsub
      pubsub.publish('TASK_WAS_NOTED', {
        taskWasNoted: newTask
      })
      return true;
    },
    finishTask: (root, args, context, info) => {
      const {uuid} = args

      // get current tasks
      const tasks = storage.get('tasks')

      const currentTask = tasks.find(task => task.uuid === uuid)
      currentTask.isFinished = true

      storage.set('tasks', tasks)
    },
    redoTask: (root, args, context, info) => {
      const {uuid} = args

      // get current tasks
      const tasks = storage.get('tasks')

      const currentTask = tasks.find(task => task.uuid === uuid)
      currentTask.isFinished = false

      storage.set('tasks', tasks)
    },
    removeTask: (root, args, context, info) => {
      const {uuid} = args

      // get current tasks
      const tasks = storage.get('tasks')

      const newTasks = tasks.filter(task => task.uuid !== uuid)

      storage.set('tasks', newTasks)
    }
  },


  // Root resolver: Subscription
  Subscription: {
    // taskWasNoted resolver
    taskWasNoted: {
      // connect to a pubsub iterator
      subscribe: () => pubsub.asyncIterator(['TASK_WAS_NOTED']),
    },
    taskWasFinished: {
      // connect to a pubsub iterator
      subscribe: () => pubsub.asyncIterator(['TASK_WAS_FINISHED']),
    },
    taskWasRequestedRedo: {
      // connect to a pubsub iterator
      subscribe: () => pubsub.asyncIterator(['TASK_WAS_REQUESTED_REDO']),
    },
    taskWasRemoved: {
      // connect to a pubsub iterator
      subscribe: () => pubsub.asyncIterator(['TASK_WAS_REMOVED']),
    },
  }
};