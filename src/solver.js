// https://github.com/ckknight/random-js
import { MersenneTwister19937, createEntropy, integer } from 'random-js';

const seed = createEntropy();
const mt = MersenneTwister19937.seedWithArray(seed);

function rng (min, max) {
  return integer(min, max)(mt);
}

function prepShifts (shiftSheet, domain) {
  let shifts = {};

  shiftSheet
    .filter(({ count }) => +count > 0)
    .forEach(({ day, time, count }) => {
      if (!shifts[day]) shifts[day] = {};
      shifts[day][time] = Array(+count).fill({ domain: domain.slice() });
    });

  return shifts;
}

export default function (people, shiftSheet, domainConstraints) {
  const names = people.map(person => person.name);

  // Main data structure
  let shifts = prepShifts(shiftSheet, names);

  domainConstraints.forEach(({ name, day, time }) => {
    let slot = shifts[day][time].forEach(({ domain }) => {
      let i = domain.indexOf(name);
      if (i > -1) domain.splice(i, 1);
    });
  })

  console.log(shifts);

  console.log(rng(0, 100));



  // Full, random assignment

  // while RUNNING:
    // select random variable
    // for each value in domain[variable]:
      // if better: escape
      // else, keep going, lower temperature

    // if temp < threshold: escape
  return 'solution';
}
