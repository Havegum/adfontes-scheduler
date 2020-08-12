# Ad fontes shift scheduler

This project poses the scheduling of shifts at the Ad fontes bar as a constraint satisfaction problem.

The scheduling is solved in four steps:

1. Domain consistency
2. Full random assignment
3. A combination of simulated annealing and random local search.
4. Greedy search.


## How to use
![People: A list of people available for taking shifts and how many they should ideally be assigned. Shifts: A list of shifts, and how many people are needed for them. You can add and change the names of these. Just make sure same days and times have the same name. The order of days and times will on this site will match the spreadsheet. Can’t work: A list of people and the shifts they can’t work.](https://raw.githubusercontent.com/Havegum/adfontes-scheduler/master/explainer.png)

Filling only the `day`-column in the `Can't work`-sheet is shorthand for "This person can't take any shifts this day". Likewise, filling only the `shift`-column is shorthand for "This person can never work this shift on any day".

## Building and developing
This project was created with [Svelte](https://raw.githubusercontent.com/Havegum/adfontes-scheduler/master/src/explainer.png). Use yarn (or npm) to install and run after downloading like so:
```bash
yarn install
yarn dev
```
The site should now be available on [localhost:5000](localhost:5000), rebuilding and refreshing automatically whenever you change things in the `src`-folder.



Running `yarn build` builds the project for production. You can then host the `public`-folder wherever you want.
