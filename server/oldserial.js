const SerialPort = require('serialport')

class Operation {
  constructor(id, steps, callback, timeout = 5000) {
    this.steps = steps
    this.callback = callback
    this.started = false
    this.timeout = timeout
    this.finished = false
    this.timer = null
    this.canceled = false
    this.id = id
  }

  end(args = {}) {
    this.active = false
    clearTimeout(this.timer)
    this.finished = true
    this.callback(args)
  }

  cancel() {
    this.canceled = true
  }

  start() {
    this.started = true
    this.timer = setTimeout(() => {
      this.callback({error: "TIMEOUT"})
    }, this.timeout);
  }

  next() {
    if (!this.started) {
      this.start()
    }
    if (this.canceled || this.finished) {
      return null
    }
    let nextStep = this.steps.shift()
    if (!nextStep) {
      this.end()
    }
    return nextStep
  }
}

class Drill {
  constructor(port) {
    this.port = new SerialPort(port, {autoOpen: false})
    this.open()
    this.port.on('close', err => this.onClose(err))
    this.port.on('data', data => this.onData(data))
    this.port.on('error', err => this.onError(err))
    this.timer = setInterval(() => {
      this.check()
    }, 10)
    this.job = null
    this.operations = []
  }

  runJob(job) {
    this.job = job
  }

  stop() {
    if (this.job) {
      this.job.pause()
    }
  }

  start() {
    if (this.job) {
      this.job.resume()
    }
  }

  run() {
    
  }

  check() {
    if (this.operations.length > 0) {
      if (this.operations[0].finished) {
        this.operations.shift()
        this.runOperation()
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
    if (this.operations && this.operations.length > 0) {
      currentOperation = this.operations[0]
      nextStep = currentOperation.next()
      if (nextStep != null) {
        this.serial.write(nextStep)
      } else {
        this.operations.shift()
        this.runOperation()
      }
    }
  }

  onData(data) {
    console.log(data)
    if (data == "done") {
      this.run()
    }
  }

  block(holes, depth, callback) {
    let steps = []
    for (hole of holes) {
      steps += [
        `linear ${hole}`,
        `clamp 1`,
        `drill ${depth}`,
        `drill 0`,
        `clamp 0`
      ]
    }
    this.operations << new Operation(steps, callback)
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
    this.operations << new Operation([
      `drill ${depth}`
    ], callback)
  } 

  linear(position, callback = null) {
    this.operations << new Operation([
      `linear ${position}`
    ], callback)
  }

  pneumatic(state, callback = null) {
    this.operations << new Operation([
      `clamp ${position}`
    ], callback)
  }
}


module.exports = Drill