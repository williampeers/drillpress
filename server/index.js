const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const lodashId = require('lodash-id')

const adapter = new FileSync('db.json')
const db = low(adapter)
const shortid = require('shortid')

db.defaults({ jobs: [], drilled_blocks: [], power: false, drill_state: 'idle'}).write()
db.set('power', true).write()

// const Serial = require('./serial')

var server = require('http').createServer();
var io = require('socket.io')(server);

const emit_state = () => io.emit('drill_state', db.get('drill_state').value())

const set_drill_state = (drill_state) => {db.set('drill_state', drill_state).write(); emit_state()}
const emit_operation= (operation) => {io.emit('operation', operation)}

const emit_all_jobs = () => io.emit('all_jobs', db.get('jobs').value())

const emit_next_block = () => {
  let jobs = db.get('jobs').value()
  if (jobs.length == 0) {
    set_drill_state('idle')
    return null
  } else {
    if (jobs[0].complete >= jobs[0].count) {
      db.get('jobs')
        .remove({id: jobs[0].id})
        .write()
      emit_all_jobs()
      emit_next_block()
    } else {
      io.emit('next_block', {drilled: jobs[0].drilled, count: jobs[0].count, holes: jobs[0].holes, depth: jobs[0].depth, id: jobs[0].id})
    }
  }
}

io.on('connection', function(client){
  console.log("Client Connected")
    let jobs = db.get('jobs')
      .value()
    console.log(`Jobs: ${jobs}`)
    client.emit('all_jobs', jobs);
    client.emit('power', db.get('power').value())

  client.on('disconnect', () => {
    console.log("Client Disconnected")
  });

  client.on('checked_block', ({holes}) => {
    console.log(`check_block: ${holes}`)
    let blocks = db.get('drilled_blocks').value()
    let target_holes = db.get('jobs')
      .find({id: blocks[0].id}).value().holes
    let success = true
    for (i in holes) {
      if (abs(holes[i] - target_holes[i]) > 1) {
        success = false
      }
    }
    if (success) { 
      db.get('jobs')
        .find({id: blocks[0].id})
        .assign({ complete: blocks[0].complete + 1})
        .write()
      emit_all_jobs()
      emit_next_block()
    } else {
      console.log("block failed")
    }
    blocks.shift()
    db.set('drilled_blocks', blocks).write()
  })

  client.on('add_job', ({count, holes, depth}) => {
    console.log("Add a job")
    db.get('jobs')
      .push({id: shortid.generate(), count: parseInt(count), holes, depth, complete: 0, drilled: 0})
      .write()
    emit_all_jobs()
  });

  client.on('current_job', () => {
    console.log("current job")
    let job = db.get('jobs')
      .sortBy('id')
      .take(1)
      .value()[0]
  });

  client.on('all_jobs', () => {
    console.log("All jobs")
    let jobs =  db.get('jobs')
      .value()
    client.emit('all_jobs', jobs)
  });

  client.on('remove_job', ({id}) => {
    console.log(`Remove Job ${id}`)
    db.get('jobs')
      .remove({id})
      .write()
    db.get('drilled_blocks')
      .remove({id})
      .write()
    emit_all_jobs()
  });

  client.on('turnon', () => {
    db.set('power', true)
      .write()
    io.emit('power', true)
  });

  client.on('turnoff', () => {
    db.set('power', false)
      .write()
    io.emit('power', false)
  });

  client.on('power', () => {
    client.emit('power', db.get('power').value())
  });

  client.on('get_drill_state', () => {
    client.emit('drill_state', db.get('drill_state').value())
  })

  client.on('set_drill_state', (state) => {
    set_drill_state(state)
  })

  client.on('start', () => {
    io.emit("drill_start")
  })

  client.on('stop', () => {
    io.emit("drill_stop")
  })

  client.on('drill_extend', () => {
    io.emit('drill_extend')
  })

  client.on('drill_retract', () => {
    io.emit('drill_retract')
  })

  client.on('drill_moveto', (position) => {
    io.emit('drill_moveto', position)
  })

  client.on('linear_down', () => {
    io.emit('linear_down')
  })

  client.on('linear_up', () => {
    io.emit('linear_up')
  })

  client.on('linear_moveto', (position) => {
    io.emit('linear_moveto', position)
  })

  client.on('next_block', () => {
    emit_next_block()
  })

  client.on('block_drilled', ({id}) => {
    console.log(`Block drilled ${id}`)
    let block = db.get('jobs')
      .find({id})
      .value()
    if (!block) {
      return
    }
    db.get('drilled_blocks')
      .push(block)
      .write()
    db.get('jobs')
      .find({id})
      .assign({ drilled: block.drilled + 1})
      .write()
    emit_all_jobs()
  })
});

console.log("starting...")
server.listen(8000);