<script>
import { fade } from 'svelte/transition';

import fetchAndParse from './dataFetcher.js';
import solver from './solver.js';

import Schedule from './Schedule.svelte';
import Loader from './Loader.svelte';
import Error from './Error.svelte';

export let env;
const { sheetId, dev, apiKey } = env;

let shifts, problem, i;
const iterations = 4000;
let running = false;

// Fetch data for people, shifts, constraints
const sheetNames = ['People', 'Shifts', 'Can\'t work'];
let [ pPromise, sPromise, cPromise ] = sheetNames.map(fetchAndParse({ sheetId, apiKey }));
let promises = Promise.all([pPromise, sPromise, cPromise]);

promises.then(input => {
	problem = solver(...input);
	problem.initialize();
	shifts = problem.shifts;
	iterate();
});

function iterate() {
	running = true;
	i = 0;

	function end () {
		problem.iterGreed();
		running = false;
	}

	window.requestAnimationFrame(function step () {
		// Repaints are expensive so we'll only do them every 100th iteration
		for (let j = 0; j < 100; j++) {
			// For reasons I don't quite understand, using both models got
			// better results in fewer iterations. Maybe the simulated annealing
			// parameters could be tweaked in the future, but this also just works ...
			problem.iterateSimulatedAnnealing();
			problem.iterateLocalBest();
			i++;
		}
		shifts = problem.shifts;
		window.requestAnimationFrame(i < iterations ? step : end);
	});
}

function restart () {
	problem.initialize();
	shifts = problem.shifts;
	iterate();
}
</script>



<main>
	<section>
		<h1>Ad fontes shift&nbsp;scheduler{@html dev ? '&nbsp;(dev)' : ''}</h1>

		<p>Fetches data from <a href="https://docs.google.com/spreadsheets/d/{sheetId}/edit">this spreadsheet</a></p>
	</section>

	{#await promises}
		<h2>Loading spreadsheets</h2>
		<div class="loaders">
			<Loader promise={pPromise}>People</Loader>
			<Loader promise={sPromise}>Shifts</Loader>
			<Loader promise={cPromise}>Can't work</Loader>
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
			<Loader promise={pPromise}>People</Loader>
			<Loader promise={sPromise}>Shifts</Loader>
			<Loader promise={cPromise}>Can't work</Loader>
		</div>
		<Error {err} />

	{/await}


	<details class="explainer">
		<summary><h2>How to use</h2></summary>
		<p>Fill the sheet in the manner described by the following illustration. For more information <a href="https://github.com/Havegum/adfontes-scheduler">see this readme</a>.</p>
		<img src="explainer.png" alt="">
	</details>
	<div class="spacer"></div>
	<div class="spacer"></div>

	<footer>
		<p>By <a href="mailto:halvard.vegum+adfontes@gmail.com">Halvard Vegum</a> · <a href="https://twitter.com/Havegum">@Havegum</a> · <a href="https://github.com/Havegum/adfontes-scheduler">project&nbsp;repo</a></p>
	</footer>
</main>



<style>
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

}
@media screen and (min-width: 600px) {
	main {
		padding: 1em;
	}
}

@media screen and (min-width: 1024px) {
	main {
		border-radius: 3px;
		box-shadow: 0 2px 4px #0002;
	}
}

section {
	margin-bottom: 2em;

}

h1 {
	line-height: 1.1;
	margin-bottom: .2em;
	font-size: 2em;
	color: #393d91;
}

.spacer {
	flex: 1 0 1em;
}

.loaders {
	display: flex;
	flex-direction: row;

}
.loaders :global(div) {
	margin-right: 0.2em;
}

.loaders :global(div + div) {
	margin-left: 1em;
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

}
button:hover {
	background-color: #393d91;
	border: 2px solid #393d91;
}
button:active {
	background-color: #292d7e;
	border: 2px solid #292d7e;
}

button:focus {
	outline: 2px;
}

button span {
	position: relative;
	z-index: 1;
}

/* .secondary {
	background-color: transparent;
	color: #4243b6;

}

.secondary:hover,
.secondary:active {
	color: white;
} */

button:disabled {
	cursor: not-allowed;
	background-color: lightgray;
	border: 2px solid lightgray;
	color: #555;
	font-style: italic;
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

details {
	margin: 1em -0.5em;
	padding: 0 .5em;
}

details summary {
	margin: 0 -0.5em;
	padding: .5em;
	border-radius: 3px;
	cursor: pointer;
}

details:not([open]) h2 {
	font-size: 16px;
	font-weight: normal;
}

details:not([open]):hover summary {
	background-color: #f8f8f8;
}

details h2 {
	display: inline;
}

details p {
	margin-bottom: 8px;
	font-style: italic;
}

img {
	display: block;
	width: 100%;
	height: auto;
}

@keyframes fader {
  from { background-color: lightgray }
  to { background-color: #f8f8f8 }
}
</style>
