const SerialPort = require('serialport')

class Operation {
  constructor(steps, callback, timeout = 5000) {
    this.steps = steps.split(',')
    this.callback = callback
    this.started = false
    this.timeout = timeout
    this.finished = false
    this.timer = null
    this.canceled = false
  }

  end(args = {}) {
    this.active = false
    clearTimeout(this.timer)
    this.finished = true
    if (this.callback) {
      this.callback(args)
    }
  }

  cancel() {
    this.canceled = true
  }

  start() {
    this.started = true
    this.active = true
    this.timer = setTimeout(() => {
      if (this.callback) {
        this.callback({error: "TIMEOUT"})
      }
    }, this.timeout);
  }

  next() {
    console.log("next")
    if (!this.started) {
      this.start()
    }
    if (this.canceled || this.finished) {
      return null
    }
    console.log("shifting")
    let nextStep = this.steps.shift(0)
    if (nextStep == 'end') {
      this.end()
      return null
    }
    return nextStep
  }
}

class Drill {
  constructor(port, {next_block, set_state, emit_operation}) {
    this.port = new SerialPort(port, {autoOpen: false})
    this.open()
    this.port.on('close', err => this.onClose(err))
    this.port.on('data', data => this.onData(data))
    this.port.on('error', err => this.onError(err))
    this.timer = setInterval(() => {
      this.run()
    }, 1000)
    this.job = null
    this.operations = []
    this.next_block = next_block
    this.set_state = set_state
    this.emit_operation = emit_operation
    this.automatic = true
    this.running = false
  }

  runJob(job) {
    this.job = job
  }

  stop() {
    this.running = false
    this.set_state('paused')
  }

  start() {
    this.running = true
    this.set_state('idle')
  }

  run() {
    console.log('run')
    if (this.running) {
      if (this.operations.length > 0) {
        if (this.operations[0].finished) {
          this.operations.shift()
          this.run()
        } else {
          this.operations.started = true
          this.runOperation()
        }
      } else {
        if (this.automatic) {
          let block = this.next_block()
          if (block) {
            this.block(block.holes, block.depth, block.cb)
          }
        } else {
          this.set_state('idle')
        }
      }
    }
  }

  open() {
    if (! this.port.opening) {
      this.port.open(err => this.onOpen(err))
    }
  }

  onOpen(err) {
    if (! this.port.isOpen) {
      this.open()
    } else {
      console.log(err)
    }
  }

  onError(err) {
    if (err.disconnect) {
      this.port.open()
    } else {
      console.log(err)
    }
  }

  onClose(err) {
    if (err.disconnect) {
      this.port.open()
    } else {
      console.log(err)
    }
  }

  runOperation() {
    console.log(this.operations)
    if (this.operations && this.operations.length > 0) {
      let currentOperation = this.operations[0]
      let nextStep = currentOperation.next()
      if (nextStep != null) {
        this.emit_operation(nextStep.split()[0])
        // this.serial.write(nextStep)
      } else {
        this.operations.shift()
        this.runOperation()
      }
    }
  }

  onData(data) {
    console.log(data)
    if (data == "done") {
      this.runOperation()
    }
  }

  block(holes, depth, callback) {
    let steps = []
    for (let hole of holes) {
      steps += [
        `linear ${hole}`,
        `clamp 1`,
        `drill ${depth}`,
        `drill 0`,
        `clamp 0`
      ]
    }
    steps << 'end'
    console.log(steps)d
    'qwer' + 123
    this.operations.push(new Operation(steps, callback))
  }

  hole(position, depth, callback = null) {
    this.operations << new Operation([
      `linear ${position}`,
      `clamp 1`,
      `drill ${depth}`,
      `drill 0`,
      `clamp 0`
    ], callback)
  }

  drill(depth, callback = null) {
    this.operations.push(new Operation([
      `drill ${depth}`
    ], callback))
  } 

  linear(position, callback = null) {
    this.operations.push(new Operation([
      `linear ${position}`
    ], callback))
  }

  pneumatic(state, callback = null) {
    this.operations.push(new Operation([
      `clamp ${position}`
    ], callback))
  }
}


module.exports = Drill