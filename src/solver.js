// https://github.com/ckknight/random-js
import { MersenneTwister19937, createEntropy, integer, bool } from 'random-js';

// RNG setup
const mt = MersenneTwister19937.autoSeed();
function rng ({ min=0, max=100 } = {}) {
  return integer(min, max)(mt);
}


function random (list) {
  return list[rng({ max: list.length - 1 })];
}


// Initializes the problem variable structure
function prepShifts (shiftSheet, domain) {
  let shifts = {};
  shiftSheet
    .filter(({ count }) => +count > 0)
    .forEach(({ day, time, count }) => {
      if (!shifts[day]) shifts[day] = {};
      shifts[day][time] = Array(+count).fill(undefined);
      shifts[day][time].domain = domain.slice();
    });
  return shifts;
}

function remove (value) {
  return {
    from: arr => {
      let i = arr.indexOf(value);
      if (i > -1) arr.splice(i, 1);
    }
  };
}


// Export
export default function solver (peopleSheet, shiftSheet, domainConstraints) {
  const names = peopleSheet.map(person => person.name);

  // Problem variable structure
  let shifts = prepShifts(shiftSheet, names);

  // Enforce domain consistency by getting rid
  // of values that can never be a solution
  domainConstraints.forEach(({ name, day, time }) => {
    const makeConsistent = (day, time) => remove(name).from(shifts[day][time].domain);

    if (!time)
      for (let time in shifts[day])
        makeConsistent(day, time);

    else if (!day)
      for (let day in shifts)
        makeConsistent(day, time);

    else
      makeConsistent(day, time);
  });




  let people = {};
  for (let i = 0; i < peopleSheet.length; i++) {
    people[peopleSheet[i].name] = {
      target: +peopleSheet[i].shifts,
      assigned: 0
    };
  }

  // Problem object
  let problem = new Object({
    shifts,
    people,
    startTemp: 1e6
  });

  // Full, random assignment
  problem.initialize = function () {
    for (let day in shifts) {
      for (let time in shifts[day]) {
        let shift = shifts[day][time];
        for (let n = 0; n < shift.length; n++) {
          let index = rng({ max: shift.domain.length - 1 });
          shift[n] = shift.domain[index];
        }
      }
    }

    problem.temperature = problem.startTemp;
    problem.score = problem.calcScore();
  }

  problem.calcScore = function () {
    for (let name in people) people[name].assigned = 0;

    let dayLimitExceeded = 0;

    for (let day in shifts) {
      let dayList = {};
      for (let time in shifts[day]) {
        for (let name of shifts[day][time]) {
          if (dayList[name]) {
            dayLimitExceeded += 1;
          } else {
            dayList[name] = true;
          }
          people[name].assigned += 1;
        }
      }
    }

    // Bonus score for hitting the target exactly
    // let hitTargetBonus = Object.values(people)
    //     .filter(person => person.target - person.assigned === 0)
    //     .length;

    let targetDifference = Object.values(people)
        .map(person => Math.abs(person.target - person.assigned))
        .reduce((sum, next) => sum + next, 0)

    let score = (targetDifference + 100 * dayLimitExceeded) * -1;

    return score;
  }


  problem.iterateLocalBest = function () {
    let day = random(Object.keys(shifts));
    let time = random(Object.keys(shifts[day]));
    let shift = shifts[day][time]
    let slot = rng({ max: shift.length - 1})

    let current = shift[slot];
    let length = shift.domain.length;
    let sign = Math.random() > 0.5 ? -1 : 1;
    let randomStart = rng({ max: length - 1 });
    let keep = false;

    for (let i = 0; i < length; i++) {
      let index = (randomStart + (i * sign) + length) % length;
      shift[slot] = shift.domain[index];

      let score = problem.calcScore();
      if (score > problem.score) {
        problem.score = score;
        keep = true;
        current = shift[slot];
      }
    }
    shift[slot] = current;
  }


  problem.iterateSimulatedAnnealing = function () {
    // Pick random variable
    let day = random(Object.keys(shifts));
    let time = random(Object.keys(shifts[day]));
    let shift = shifts[day][time]
    let slot = rng({ max: shift.length - 1})

    // Keep track of old value
    let oldValue = shift[slot];

    // Choose new value and check score
    let randomValueIndex = rng({ max: shift.domain.length - 1 });
    shift[slot] = shift.domain[randomValueIndex];
    let score = problem.calcScore();

    if (score >= problem.score) {
      // If score is better, keep
      problem.score = score;

    } else {
      // Otherwise, roll dice ...
      let exponential = (score - problem.score) / problem.temperature
      let keep = bool(Math.E ** exponential)(mt);
      if (keep) {
        // Keep despite worse score, lower temperature
        problem.temperature *= .80
        problem.score = score;
      } else {
        // Revert to old value
        shift[slot] = oldValue;
      }
    }
    // See also:
    // * INFO289-6.pdf
    // * https://artint.info/2e/html/ArtInt2e.Ch4.S9.html
    // * https://youtu.be/d1KyYyLmGpA?list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi&t=1557
  }


  problem.greed = function () {
    for (let day in shifts) {
      for (let time in shifts[day]) {
        let shift = shifts[day][time];
        let domain = shift.domain;
        for (let slot = 0; slot < shift.length; slot++) {
          // For every slot
          let oldValue = shift[slot];
          for (let name of domain) {
            // Check every name, keep improvements
            shift[slot] = name;
            let score = problem.calcScore();
            if (score > problem.score) {
              problem.score = score;
              oldValue = name;
            }
          }
        }
      }
    }
  }

  problem.iterGreed = function (iterations = 100) {
    for (let i = 0; i < iterations; i++) {
      problem.greed();
    }
  }


  return problem;
}
