// https://github.com/ckknight/random-js
import { MersenneTwister19937, createEntropy, integer } from 'random-js';

// RNG setup
const seed = createEntropy();
const mt = MersenneTwister19937.seedWithArray(seed);
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


// Export
export default function (peopleSheet, shiftSheet, domainConstraints) {
  const names = peopleSheet.map(person => person.name);

  // Problem variable structure
  let shifts = prepShifts(shiftSheet, names);

  // Enforce domain consistency by getting rid
  // of values that can never be a solution
  domainConstraints.forEach(({ name, day, time }) => {
    const domain = shifts[day][time].domain;
    let i = domain.indexOf(name);
    if (i > -1) domain.splice(i, 1);
  });

  // Problem object
  let problem = new Object({
    shifts,
    temperature: 1000
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
    problem.score = problem.calcScore();
  }


  problem.cool = function (cooling=1) {
    // TODO:
    problem.temperature -= cooling;
    return problem;
  }


  problem.calcScore = function ({ verbose=false }={}) {
    // TODO: create this object once for potential speedup ...
    let people = {};
    for (let i = 0; i < peopleSheet.length; i++) {
      people[peopleSheet[i].name] = {
        target: +peopleSheet[i].shifts,
        assigned: 0
      };
    }

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

    let targetAssignmentCorrect = Object.values(people)
        .filter(person => person.target - person.assigned === 0)
        .length;

    let targetAssignmentDifference = Object.values(people)
        .map(person => Math.abs(person.target - person.assigned))
        .reduce((sum, next) => sum + next, 0)

    if (verbose) {
      console.log('targetAssignmentDifference:', targetAssignmentDifference);
      console.log('targetAssignmentCorrect * 5:', targetAssignmentCorrect * 5);
      console.log('dayLimitExceeded * 100:', dayLimitExceeded * 100);
    }

    let score =
        5 * targetAssignmentCorrect +
        1 * -targetAssignmentDifference +
      100 * -dayLimitExceeded
    ;

    return score;
  }


  problem.iterate = function () {
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

  // while RUNNING:
    // select random variable
    // for each value in domain[variable]:
      // if better: escape
      // else, keep going, lower temperature

    // if temp < threshold: escape

  return problem;
}
