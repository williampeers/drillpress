var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
const Serial = require('./serial')

const serial = new Serial("/dev/ttyUSB0")

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected")
});

var blockDesignSchema = new mongoose.Schema({
  holes: [{
    centerY: Number,
    diameter: Number,
  }],
  time: Number,
  length: Number,
  width: Number,
  complete: Boolean,
});

var blockSchema = new mongoose.Schema({
  holes: [{
    centerY: Number,
    centerX: Number,
    complete: Boolean,
    diameter: Number,
  }],
  time: Number,
  length: Number,
  width: Number,
  startTime: Number,
  completeTime: Number,
  complete: Boolean,
  design: blockDesignSchema
});



var Block = mongoose.model('Block', blockSchema);


const { ApolloServer, gql, PubSub } = require('apollo-server');
const pubsub = new PubSub();

const typeDefs = gql`

  input HoleInput{
    centerY: Float
    centerX: Float
    complete: Boolean
    diameter: Float
  }

  type BlockDesign {
    name: String
    holes: [Hole]
    length: Float
    width: Float
    id: ID
  }

  type Hole {
    centerY: Float
    centerX: Float
    complete: Boolean
    diameter: Float
    id: ID
  }

  type Block {
    id: ID
    holes: [Hole]
    startTime: String
    completeTime: String
    complete: Boolean
    length: Float
    design: BlockDesign
    width: Float
  }

  type Mutation {
    startBlock(length: Float, width: Float, holes: [HoleInput]): Block
    addHole(block_id: ID, diameter: Float, centerX: Float, centerY: Float): Block
    completeBlock(id: ID): Block
    deleteBlock(id: ID): Block
    deleteBlockDesign(id: ID): BlockDesign
    createBlockDesign(length: Float, width: Float, holes: [HoleInput]): BlockDesign
  }

  type Query {
    block(id: ID): Block
    allBlocks: [Block]
    blocksBetween(from: Int, to: Int): [Block]
    blockDesign(id: ID): BlockDesign
    allBlockDesigns: [BlockDesign]
  }

  type Subscription {
    blockCompleted: Block
    blockStarted: Block
    timePerBlock: Float
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Mutation: {
    startBlock: (_, {width, length, holes}) => {
      return Block.create({width, length, holes, startTime: new Date().getTime()}).then(block => {
        pubsub.publish('BLOCK_STARTED', {blockStarted: block});
        return block
      })
    },
    completeBlock: (_, {id}) => {
      return Block.findByIdAndUpdate(id, {complete: true, completeTime: new Date().getTime()}, {new: true}).then(block => {
        let now = new Date().getTime()
        return Block.find({complete: true, startTime: { "$gte": now - 1* 60 * 1000  }}).limit(5).then(blocks => {
          let sum = 0
          blocks.forEach(({startTime, completeTime}) => {
            sum += completeTime - startTime
          })
          pubsub.publish('TIME_PER_BLOCK', {timePerBlock: sum/blocks.length / 1000});
          pubsub.publish('BLOCK_COMPLETED', {blockCompleted: block});
          return block
        })
      })
    },
    addHole: (_, {block_id, diameter, centerX, centerY}) => {
      return Block.findByIdAndUpdate(block_id, 
        { $push: { holes: {diameter, centerX, centerY} } },
        {new: true}
      )
    },
    deleteBlock: (_, {id}) => Block.deleteByIdAndDelete(id).exec(),
    deleteBlockDesign: (_, {id}) => BlockDesign.deleteByIdAndDelete(id).exec(),
    createBlockDesign: (_, {length, width, holes}) => Block.create({length, width, holes})
  },
  Query: {
    block: (_, {id}) => Block.findById(id).exec(),
    allBlocks: () => Block.find({}).exec(),
    blocksBetween: (_, {from, to}) => Block.find().exec(),
    allBlockDesigns: (_,{id, name}) => {
      if (id) {
        return BlockDesign.findById(id).exec()
      } else {
        return BlockDesign.findOne({name}).exec()
      }
    },
    blockDesign: (_,) => BlockDesign.find({}).exec(),
  },
  Subscription: {
    blockCompleted:  {
      subscribe: () => pubsub.asyncIterator(['BLOCK_COMPLETED'])
    }, 
    blockStarted:  {
      subscribe: () => pubsub.asyncIterator(['BLOCK_STARTED'])
    },
    timePerBlock: {
      subscribe: () => pubsub.asyncIterator(['TIME_PER_BLOCK'])
    },
  }
};


const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});