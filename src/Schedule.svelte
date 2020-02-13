<script>
export let shifts;

$: if (!initialized) getHeaders(shifts);

let initialized = false;
let days = [];
let times = [];

function getHeaders (shifts) {
  days = Object.keys(shifts);

  for (let day of days) {
    for (let time of Object.keys(shifts[day])) {
      if (times.indexOf(time) === -1) times.push(time);
    }
  }

  initialized = true;
}

</script>


<table>
  <thead>
    <tr>
      <th><slot></slot></th>
      {#each days as day}
        <th>{day}</th>
      {/each}
    </tr>
  </thead>

  <tbody>
    {#each times as time}
      <tr>
        <th>{time}</th>

        {#each days as day}
          <td>
            {#each shifts[day][time] as name}
              <p>{name}</p>
            {/each}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
table {
  width: 100%;
  min-width: 40em;
  border-collapse: collapse;
  table-layout: fixed;
}

thead th {
  text-align: left;
}

thead th:first-child {
  width: 12ch;
}

tbody th {
  text-align: right;
}

td, th {
  padding: .5em;
  overflow: hidden;
}

tbody tr {
  height: 7.75em;
}

@media screen and (min-width: 600px) {
  tbody tr { height: 7em }
}

@media screen and (min-width: 1024px) {
  tbody tr { height: 6em }
}

thead {
  border-bottom: 2px solid #ccc;
}

tbody th:first-child {
  border-right: 2px solid #ccc;
}

tbody tr:nth-child(2n - 1) {
  background: #ebebea;
}

thead tr,
tbody tr:nth-child(2n) {
  background: #f4f4f3;
}

p {
  line-height: 1em;
}

p + p {
  margin-top: 0.75em;
}
</style>
