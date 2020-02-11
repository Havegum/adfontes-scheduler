<script>
import { tsvParse } from 'd3-dsv';
import Loader from './Loader.svelte';
import Schedule from './Schedule.svelte';
import solver from './solver.js';
import sleep from './sleep.js';
import { fade } from 'svelte/transition';

const peopleURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-PZy7lDNzIKt9qxguH5QGCRCQajbEiodCHfaPotQOo2bz5GbCYehtSxJKKELegyClx6cA0i44N0Q0/pub?gid=0&single=true&output=tsv";
const shiftsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-PZy7lDNzIKt9qxguH5QGCRCQajbEiodCHfaPotQOo2bz5GbCYehtSxJKKELegyClx6cA0i44N0Q0/pub?gid=1385025767&single=true&output=tsv";
const constraintsURL ="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-PZy7lDNzIKt9qxguH5QGCRCQajbEiodCHfaPotQOo2bz5GbCYehtSxJKKELegyClx6cA0i44N0Q0/pub?gid=517938983&single=true&output=tsv";

let peoplePromise = fetch(peopleURL).then(d => d.text()).then(tsvParse);
let constraintsPromise = fetch(constraintsURL).then(d => d.text()).then(tsvParse);
let shiftsPromise = fetch(shiftsURL).then(d => d.text()).then(tsvParse);

let promises = Promise.all([
	peoplePromise,
	shiftsPromise,
	constraintsPromise
]);

let shifts;
let problem;
let iterations = 400;
let i = 0;
let running = false;

async function iterate () {
	running = true;
	for (i = 0; i < iterations; i++) {
		problem.iterateSimulatedAnnealing();
		// For reasons I don't quite understand, using both iteration models
		// together got better results quicker. Maybe the simulated annealing
		// parameters could be tweaked in the future, but this also just works ...
		problem.iterateLocalBest();
		shifts = problem.shifts;
		await sleep(1)
	}
	problem.iterGreed(); // Greed is good?
	running = false;
}

function restart () {
	problem.initialize();
	shifts = problem.shifts;
	iterate();
}

promises.then(([people, shiftSheet, constraints]) => {
	problem = solver(people, shiftSheet, constraints);
	problem.initialize();
	shifts = problem.shifts;
	iterate();
});
</script>

<main>
	<section>
		<h1>Ad fontes shift scheduler</h1>
		<p class="byline">Put together very ad hoc by Halvard Vegum</p>
		<p>Fetches data from <a href="https://docs.google.com/spreadsheets/d/1t2cLgwEzOyVZ7JwMY3qtr3HfmKLcG2kzO5udaF7gPb0/edit?usp=sharing">this spreadsheet</a></p>
	</section>

	{#await promises}
		<h2>Loading spreadsheets</h2>
		<div class="loaders">
			<Loader promise={peoplePromise}>People</Loader>
			<Loader promise={shiftsPromise}>Shifts</Loader>
			<Loader promise={constraintsPromise}>Can't work</Loader>
		</div>

	{:then data}
		<div class="table" in:fade={{ duration: 100 }}>
			<Schedule {shifts}>
				<button on:click={restart} disabled={running}>
					<span>{running ? 'scheduling' : 'Rerun!'}</span>
					<div class="iteration-loader" style="width: {100 * i / iterations}%"></div>
				</button>
			</Schedule>
		</div>

	{:catch err}
		<h2>Error loading spreadsheets</h2>
		<div class="loaders">
			<Loader promise={peoplePromise}>People</Loader>
			<Loader promise={shiftsPromise}>Shifts</Loader>
			<Loader promise={constraintsPromise}>Can't work</Loader>
		</div>
	{/await}

	<div class="spacer"></div>

	<footer>
		<p>By <a href="mailto:halvard.vegum+adfontes@gmail.com">Halvard Vegum</a> · <a href="https://twitter.com/Havegum">@Havegum</a> · <a href="https://github.com/Havegum/adfontes-scheduler">project repo</a></p>
	</footer>
</main>

<style lang="scss">
main {
	position: relative;
  height: auto;
	min-height: 100%;
  display: flex;
  flex-direction: column;
	max-width: 65em;
	margin: 0 auto;
	background-color: white;
	padding: 8px;

	@media screen and (min-width: 600px) {
		padding: 1em;
	}

	@media screen and (min-width: 1024px) {
		border-radius: 3px;
		box-shadow: 0 2px 4px #0002;
	}
}

section {
	margin-bottom: 2em;

	h1 {
		font-size: 2em;
		color: #393d91;
	}
}

.spacer {
	flex: 1 0 1em;
}

.loaders {
	display: flex;
	flex-direction: row;

	:global(div) {
		margin-right: 0.2em;
	}

	:global(div + div) {
		margin-left: 1em;
	}
}

.table {
  overflow-x: auto;
	flex-shrink: 0;
}

button {
	position: relative;
	cursor: pointer;
	background-color: #4243b6;
	color: white;
	margin: 0;
	font-size: 1em;
	width: 11ch;
	overflow: hidden;
	border-radius: .25em;
	border: 2px solid #4243b6;

	&:hover {
		background-color: #393d91;
		border: 2px solid #393d91;
	}

	&:active {
		background-color: #292d7e;
		border: 2px solid #292d7e;
	}

	&:focus {
		outline: 2px;
	}

	span {
		position: relative;
		z-index: 1;
	}
}

.secondary {
	background-color: transparent;
	color: #4243b6;

	&:hover,
	&:active {
		color: white;
	}
}

button:disabled {
	cursor: not-allowed;
	background-color: lightgray;
	border: 2px solid lightgray;
	color: #555;
	font-style: italic;

	// animation: fader 500ms ease-in-out infinite alternate-reverse;
}

.iteration-loader {
	position: absolute;
	z-index: 0;
	top: 0;
	left: 0;
	bottom: 0;
	width: 0;
	background-color: white;
	opacity: 1;
	transition: opacity 350ms ease-out;
}

button:not(:disabled) .iteration-loader {
	opacity: 0;
}

@keyframes fader {
  from { background-color: lightgray }
  to { background-color: #f8f8f8 }
}
</style>
