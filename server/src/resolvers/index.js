import getStorage from '../utils/getStorage';
import getPubSub from '../utils/getPubSub';

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
      return [];
    },
  },


  // Root resolver: Mutation
  Mutation: {
    // wrtiteANewTask resolver
    writeANewTask: (root, args, context, info) => {
      // creating a new task from storage

      // send TASK_WAS_NOTED event to pubsub
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