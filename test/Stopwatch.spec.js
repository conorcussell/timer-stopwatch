const Stopwatch = require('../lib/Stopwatch.js');

describe('Countdown Timer', function() {
  it('should be able to create a countdown watch with 30 seconds', function() {
    var countdownTimer = new Stopwatch(30000);
    expect(countdownTimer.countDownMS).toBe(30000);
    expect(countdownTimer.ms).toBe(30000);
  });

  it('should be able to change the countdown time during reset', function() {
    var countdownTimer = new Stopwatch(30000);
    expect(countdownTimer.countDownMS).toBe(30000);
    countdownTimer.reset(60000);
    expect(countdownTimer.countDownMS).toBe(60000);
    expect(countdownTimer.ms).toBe(60000);
  });

  it('should countdown at max refresh speed', function(done) {
    var countdownTimer = new Stopwatch(60000, { refreshRateMS: 1 });
    var startTime = countdownTimer.ms;
    countdownTimer.start();
    setTimeout(function() {
      countdownTimer.stop();
      expect(countdownTimer.ms).toBeLessThan(startTime);
      done();
    }, 3);
  });

  it('should countdown, pause, then continue', function(done) {
    var countdownTimer = new Stopwatch(50, { refreshRateMS: 1 });
    var startTime = countdownTimer.ms;
    var splittime = 0;
    countdownTimer.start();
    setTimeout(function() {
      countdownTimer.stop();
      splittime = countdownTimer.ms;
      expect(splittime).toBeLessThan(startTime);
    }, 10);

    setTimeout(function() {
      expect(splittime).toBe(countdownTimer.ms);
      countdownTimer.start();
    }, 20);

    setTimeout(function() {
      countdownTimer.stop();
      expect(countdownTimer.ms).toBeLessThan(splittime);
      done();
    }, 30);
  });

  it('should fire the time event', function(done) {
    var countdownTimer = new Stopwatch(60000);
    var startTime = countdownTimer.ms;

    countdownTimer.on('time', function(time) {
      expect(time.ms).toEqual(countdownTimer.ms);
      if (countdownTimer.state === 1) {
        done();
      }
      countdownTimer.stop();
    });
    countdownTimer.start();
  });

  it('should fire the almostdone event', function(done) {
    var countdownTimer = new Stopwatch(40, {
      almostDoneMS: 20,
      refreshRateMS: 10
    });
    var startTime = countdownTimer.ms;

    var onDone = function onDone() {
      countdownTimer.stop();
      expect(countdownTimer.ms).toBeLessThan(20);
      expect(countdownTimer.ms).toBeGreaterThan(5);
      countdownTimer.off('almostdone', onDone);
      done();
    };

    countdownTimer.start();
    countdownTimer.on('almostdone', onDone);
  });

  it('should fire the done event', function(done) {
    var countdownTimer = new Stopwatch(30, { almostDoneMS: 20 });
    var startTime = countdownTimer.ms;

    var onDone = function onDone() {
      expect(countdownTimer.ms).toEqual(0);
      countdownTimer.off('done', onDone);
      done();
    };

    countdownTimer.start();
    countdownTimer.on('done', onDone);
  });

  it('should fire the done event when done again after reset', function(done) {
    var countdownTimer = new Stopwatch(40, {
      almostDoneMS: 20,
      refreshRateMS: 10
    });
    var startTime = countdownTimer.ms;

    var doneFiredTimes = 0;

    setTimeout(function() {
      expect(doneFiredTimes).toBe(3);
      countdownTimer.off('done', onDone);
      done();
    }, 350);

    var onDone = function onDone() {
      doneFiredTimes++;
      setTimeout(function() {
        expect(countdownTimer.ms).toEqual(0);
        expect(countdownTimer.doneFired).toEqual(true);
        countdownTimer.reset();
        expect(countdownTimer.ms).toEqual(40);
        countdownTimer.start();
        setTimeout(function() {
          expect(countdownTimer.doneFired).toEqual(false);
          expect(countdownTimer.ms).toBeGreaterThan(15);
          expect(countdownTimer.ms).toBeLessThan(31);
        }, 20);
      }, 100);
    };

    countdownTimer.start();
    countdownTimer.on('done', onDone);
  });

  it('should fire the almostdDone event when ALMOST done again after reset', function(done) {
    var countdownTimer = new Stopwatch(40, {
      almostDoneMS: 20,
      refreshRateMS: 10
    });
    var startTime = countdownTimer.ms;

    var doneFiredTimes = 0;

    setTimeout(function() {
      expect(doneFiredTimes).toBe(3);
      countdownTimer.off('almostdone', onDone);
      done();
    }, 350);

    var onDone = function onDone() {
      doneFiredTimes++;
      setTimeout(function() {
        countdownTimer.reset();
        countdownTimer.start();
      }, 100);
    };

    countdownTimer.start();

    countdownTimer.on('almostdone', onDone);
  });

  it('should fire the forcestop event', function(done) {
    var countdownTimer = new Stopwatch(50, { almostDoneMS: 20 });

    var onStop = function onStop() {
      expect(true).toEqual(true);
      countdownTimer.off('stop', onStop);
      done();
    };

    countdownTimer.start();
    countdownTimer.on('stop', onStop);
    countdownTimer.stop();
  });
});

describe('Stopwatch', function() {
  it('should be able to create a stopwatch', function() {
    var countdownTimer = new Stopwatch();
    expect(countdownTimer.countDownMS).toBe(false);
  });

  it('should count up with a moderate refresh rate', function(done) {
    var stopwatch = new Stopwatch(false, { refreshRateMS: 50 });
    var startTime = stopwatch.ms;
    stopwatch.start();
    setTimeout(function() {
      expect(stopwatch.ms).toEqual(startTime);
    }, 30);

    setTimeout(function() {
      stopwatch.stop();
      expect(stopwatch.ms).toBeGreaterThan(startTime);
      done();
    }, 60);
  });

  it('should countup at max refresh speed', function(done) {
    var stopwatch = new Stopwatch(false, { refreshRateMS: 1 });
    var startTime = stopwatch.ms;
    stopwatch.start();
    setTimeout(function() {
      stopwatch.stop();
      expect(stopwatch.ms).toBeGreaterThan(startTime);
      done();
    }, 3);
  });

  it('should countup, pause, then continue', function(done) {
    var stopwatch = new Stopwatch(false, { refreshRateMS: 1 });
    var startTime = stopwatch.ms;
    var splittime = 0;
    stopwatch.start();
    setTimeout(function() {
      stopwatch.startstop();
      splittime = stopwatch.ms;
      expect(splittime).toBeGreaterThan(startTime);
    }, 10);

    setTimeout(function() {
      expect(splittime).toBe(stopwatch.ms);
      stopwatch.startstop();
    }, 20);

    setTimeout(function() {
      stopwatch.startstop();
      expect(stopwatch.ms).toBeGreaterThan(splittime);
      done();
    }, 30);
  });

  it('Should reset to 0', function(done) {
    var stopwatch = new Stopwatch(false, { refreshRateMS: 1 });

    stopwatch.startstop();

    setTimeout(function() {
      expect(stopwatch.ms).toBeGreaterThan(90);
      expect(stopwatch.ms).toBeLessThan(110);
      stopwatch.reset();
      expect(stopwatch.ms).toBe(0);
      setTimeout(function() {
        stopwatch.startstop();
        setTimeout(function() {
          expect(stopwatch.ms).toBeGreaterThan(90);
          expect(stopwatch.ms).toBeLessThan(110);
          stopwatch.reset();
          expect(stopwatch.ms).toBe(0);
          done();
        }, 100);
      }, 100);
    }, 100);
  });

  it('should fire the time event', function(done) {
    var stopwatch = new Stopwatch();
    var startTime = stopwatch.ms;
    stopwatch.on('time', function(time) {
      expect(time.ms).toEqual(stopwatch.ms);
      if (stopwatch.state === 1) {
        done();
      }
      stopwatch.stop();
    });
    stopwatch.start();
  });

  it('should NOT fire the almostdone event', function(done) {
    var stopwatch = new Stopwatch(false, {
      almostDoneMS: 50,
      refreshRateMS: 10
    });
    stopwatch.start();
    var fired = false;
    stopwatch.on('almostdone', function(formatted, ms) {
      fired = true;
    });
    setTimeout(function() {
      expect(fired).toBe(false);
      done();
    }, 60);
  });

  it('should NOT fire the done event', function(done) {
    var stopwatch = new Stopwatch();
    stopwatch.start();
    var fired = false;
    stopwatch.on('done', function(formatted, ms) {
      fired = true;
    });
    setTimeout(function() {
      expect(fired).toBe(false);
      done();
    }, 60);
  });

  it('should fire the stop event', function(done) {
    var stopwatch = new Stopwatch();

    var onStop = function onStop() {
      expect(true).toEqual(true);
      stopwatch.off('stop', onStop);
      done();
    };

    stopwatch.start();
    stopwatch.on('stop', onStop);
    stopwatch.stop();
  });
});
