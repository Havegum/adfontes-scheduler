<script>
import { tsvParse } from 'd3-dsv';
import Loader from './Loader.svelte';
import solver from './solver.js';

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

promises.then(([people, shifts, constraints]) => {
	solver(people, shifts, constraints);
});

</script>

<h1>Ad fontes shift scheduler</h1>
<p class="byline">By Halvard Vegum</p>

{#await promises}
	<h2>Loading spreadsheets</h2>
{:then data}
	<h2>Spreadsheets</h2>
{:catch err}
	<h2>Error loading spreadsheets</h2>
{/await}

<div class="loaders">
	<Loader promise={peoplePromise}>People</Loader>
	<Loader promise={shiftsPromise}>Shifts</Loader>
	<Loader promise={constraintsPromise}>Can't work</Loader>
</div>

<style lang="scss">
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
</style>
