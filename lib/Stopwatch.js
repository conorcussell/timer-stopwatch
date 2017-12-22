const STATUS = {
  STOPPED: 0,
  RUNNING: 1,
  COMPLETE: 2
};

let mitt = require('mitt').default;
if (typeof mitt !== 'function') {
  mitt = require('mitt');
}

class Stopwatch {
  constructor(countDownMS = false, options = {}) {
    this.countDownMS = countDownMS;
    this.ms = this.countDownMS || 0;

    this.stoptime = 0; // the time the clock has been paused at
    this.refTime = 0; // reference time when started

    this.tickTimer = 0; // interval timer for updateTime

    this.almostDoneFired = false; // true if almostDone event has been fired (prevent mlti hits)
    this.doneFired = false; // true if done event has been fired (prevent multi hits)

    this.elapsedMS = 0; // number if elapsed milliseconds
    this.state = STATUS.STOPPED; // current status of the timer-stopwatch

    this.refreshRateMS = options.refreshRateMS || 50;
    this.almostDoneMS = options.almostDoneMS || 10000;

    this.emitter = mitt();

    this.reset(countDownMS);

    return this;
  }

  emit(event, data) {
    this.emitter.emit(event, data);
  }

  on(event, cb) {
    this.emitter.on(event, cb);
  }

  off(event, cb) {
    this.emitter.off(event, cb);
  }

  /**
   *
   */
  start() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    this.state = STATUS.RUNNING;

    this.refTime = new Date().getTime();
    this.refTime -= this.elapsedMS;
    this.tickTimer = setInterval(() => {
      this.updateTime();
    }, this.refreshRateMS);
    this.updateTime(this);
  }

  /**
   *
   */
  stop() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    if (this.isRunning()) {
      this.state = STATUS.STOPPED; // prevents updatedTime being called in an infinite loop
      this.updateTime(this);
      this.emit('stop');
    }
  }

  /**
   *
   */
  startstop() {
    if (this.isStopped()) {
      this.start();
      return true;
    } else {
      this.stop();
      return false;
    }
  }

  /**
   *
   * @param {Int} countDownMS
   */
  reset(countDownMS) {
    this.stop();
    this.state = STATUS.STOPPED;
    this.doneFired = false;
    this.almostDoneFired = false;
    this.elapsedMS = 0;
    this.refTime = new Date().getTime();

    if (countDownMS) {
      this.countDownMS = countDownMS;
    }
    this.ms = this.countDownMS || 0;

    this.emit('time', { ms: this.ms });
  }

  /**
   *
   */
  updateTime() {
    if (this.countDownMS > 0) {
      this.timerCountdown();
    } else {
      this.stopwatchCountup();
    }
  }

  /**
   *
   */
  timerCountdown() {
    let currentTime = new Date().getTime();

    this.elapsedMS = currentTime - this.refTime;

    let remainingSeconds = this.countDownMS - this.elapsedMS;
    if (remainingSeconds < 0) {
      remainingSeconds = 0;
    }

    this.ms = remainingSeconds;
    this.emit('time', { ms: this.ms });

    if (remainingSeconds <= 0) {
      this.stop();
      if (!this.doneFired) {
        this.doneFired = true;
        this.state = STATUS.COMPLETE;
        this.emit('done');
      }
    } else if (remainingSeconds < this.almostDoneMS) {
      if (!this.almostDoneFired) {
        this.almostDoneFired = true;
        this.emit('almostdone');
      }
    }
  }

  /**
   *
   */
  stopwatchCountup() {
    let currentTime = new Date().getTime();

    this.elapsedMS = currentTime - this.refTime;
    this.ms = this.elapsedMS;
    this.emit('time', { ms: this.ms });
  }

  isRunning() {
    return this.state === STATUS.RUNNING;
  }

  isStopped() {
    return this.state === STATUS.STOPPED;
  }

  /**
   * Adds a callback to be fired on the done event
   * @returns {Object} itself for chaining
   */
  onDone(cb) {
    this.on('done', cb);
    return this;
  }

  /**
   * Adds a callback to be fired on the almostdone event
   * @returns {Object} itself for chaining
   */
  onAlmostDone(cb) {
    this.on('almostdone', cb);
    return this;
  }

  /**
   * Adds a callback to be fired on the time event
   * @returns {Object} itself for chaining
   */
  onTime(cb) {
    this.on('time', cb);
    return this;
  }

  /**
   * Adds a callback to be fired on the stop event
   * @returns {Object} itself for chaining
   */
  onStop(cb) {
    this.on('stop', cb);
    return this;
  }
}

module.exports = Stopwatch;
