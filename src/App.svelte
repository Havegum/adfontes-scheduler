<script>
import { tsvParse } from 'd3-dsv';
import Loader from './Loader.svelte';
import Schedule from './Schedule.svelte';
import solver from './solver.js';
import sleep from './sleep.js';

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
let running = false;

promises.then(([people, shiftSheet, constraints]) => {
	problem = solver(people, shiftSheet, constraints);
	problem.initialize();
	shifts = problem.shifts;
});



async function iterate () {
	running = true;
	for (let i = 0; i < iterations; i++) {
		problem.iterate();
		shifts = problem.shifts;
		if (i % 10 == 0) await sleep(1)
	}
	running = false;
}

function restart () {
	problem.initialize();
	shifts = problem.shifts;
}
</script>

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
	<h2>Schedule some shifts!</h2>
	<div class="controls">
		<button on:click={iterate} disabled={running}>Run!</button>
		<button class="secondary" on:click={restart} disabled={running}>Restart</button>
		<label for="iterations"><input id="iterations" bind:value={iterations} type="range" min="10" max="1000" step="10"/> Iterations: {iterations}</label>
	</div>
	<Schedule {shifts} />

{:catch err}
	<h2>Error loading spreadsheets</h2>
	<div class="loaders">
		<Loader promise={peoplePromise}>People</Loader>
		<Loader promise={shiftsPromise}>Shifts</Loader>
		<Loader promise={constraintsPromise}>Can't work</Loader>
	</div>
{/await}

<footer>
	<p>By <a href="https://halvard.vegum.no/">Halvard Vegum</a> · <a href="https://twitter.com/Havegum">@Havegum</a> · Project repo</p>
</footer>

<style lang="scss">
section {
	h1 {
		font-size: 2em;
	}
	margin-bottom: 1em;
}

footer {
	flex-grow: 1;
	position: relative;

	p {
		position: absolute;
		bottom: 0;
	}
}

.controls {
	display: flex;
	align-items: center;

	* + * {
		margin-left: .5em;
	}
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

button {
	cursor: pointer;
	background-color: #4243b6;
	color: white;
	border: none;
	width: 13ch;
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
	color: black;

	animation: fader 500ms linear infinite alternate-reverse;
}

@keyframes fader {
  from { background-color: lightgray }
  to { background-color: #f8f8f8 }
}
</style>