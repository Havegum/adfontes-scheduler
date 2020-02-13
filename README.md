# Ad fontes shift scheduler

This project poses the scheduling of shifts at the Ad fontes bar as a constraint satisfaction problem.

The scheduling is solved in four steps:

1. Domain consistency
2. Full random assignment
3. A combination of simulated annealing and random local search.
4. Greedy search.


## Howto
![People: A list of people available for taking shifts and how many they should ideally be assigned. Shifts: A list of shifts, and how many people are needed for them. You can add and change the names of these. Just make sure same days and times have the same name. The order of days and times will on this site will match the spreadsheet. Can’t work: A list of people and the shifts they can’t work.](https://raw.githubusercontent.com/Havegum/adfontes-scheduler/master/src/explainer.png)
