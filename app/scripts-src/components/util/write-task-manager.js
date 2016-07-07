const FS = require('@jokeyrhyme/pify-fs')
const pify = require('pify')
const Temp = pify(require('temp').track())
const Elevator = require('elevator')
const psencode = require('./psencode')

const WRITE = Symbol('write')
const BUMP = Symbol('bump')
const UNLINK = Symbol('unlink')

module.exports = class WriteTaskManager {

  constructor() {
    this.tasks = []
  }

  // Enqueue a write to file task.
  addWriteTask(path, data) {
    this.tasks.push({ type: WRITE, path, data })
  }

  // Enqueue a bump file task.
  addBumpTask(path) {
    this.tasks.push({ type: BUMP, path })
  }

  addUnlinkTask(path) {
    this.task.push({ type: UNLINK, path })
  }

  async run() {
    let { tasks } = this
    if (tasks.length === 0) { return }
    // Try to run tasks normally.
    // Tasks are intentionally run serially. Use this functionality only if
    // tasks are dependent on each other in some way, or if it's more convenient
    // to batch them up in a single elevated command.
    while (tasks.length) {
      try {
        await this.doTask(tasks[0])
        tasks.shift()
      }
      catch (err) {
        if (err.code !== 'EPERM') { throw err }
        break
      }
    }
    let batchCommands =
      await Promise.all(tasks.map(task => this.constructBatchCommand(task)))
    /*
    batchCommands = batchCommands.reduce((a, b) =>
      a == null ? b : a.concat([';']).concat(b)
    )
    */
    batchCommands = batchCommands.join(';\n')
    await new Promise((resolve, reject) => {
      console.debug('batch', batchCommands)
      const opts = {
        hidden: false,
        terminating: true,
        doNotPushdCurrentDirectory: true,
        waitForTermination: true
      }
      Elevator.execute(
        [
          "powershell",
          "-NoProfile",
          "-EncodedCommand",
          Buffer.from(batchCommands).toString('base64')
        ],
        opts,
        (err, stdout, stderr) => {
          console.warn(`elevated cmd stderr: ${stderr}`)
          console.warn(`elevated cmd stdout: ${stdout}`)
          if (err) {

            return reject(err)
          }
          resolve(stdout.trim())
        }
      )
    })
  }

  async doTask(task) {
    let { type, path, data } = task
    if (type === WRITE) {
      await FS.writeFile(path, data)
      console.debug(`-> ${path}`)
    }
    else if (type === BUMP) {
      await FS.utimes(path, NaN, NaN)
      console.debug(`bump ${path}`)
    }
    else if (type === UNLINK) {
      await FS.unlink(path)
      console.debug(`x ${path}`)
    }
  }

  async constructBatchCommand(task) {
    let { type, path, data } = task
    if (type === WRITE) {
      // For write tasks, write the data in a temporary file first.
      let info = await Temp.open('')
      await FS.write(info.fd, data)
      let tmpPath = info.path
      //return ['COPY', '/Y', tmpPath, path]
      return `Copy-Item ${psencode(tmpPath)} ${psencode(path)} -Force`
    }
    else if (type === BUMP) {
      //return ['COPY', '/B', path, '+,,']
      return `(Get-ChildItem ${psencode(path)}).LastWriteTime = [DateTime]::Now`
    }
    else if (type === UNLINK) {
      //return ['DEL', path]
      return `Remove-Item ${psencode(path)}`
    }
  }

}
