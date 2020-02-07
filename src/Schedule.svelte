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
      <th>&nbsp;</th>
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
  border-collapse: collapse;
  table-layout: fixed;
}

thead th {
  text-align: left;
}

tbody th {
  text-align: right;
}

td, th {
  padding: .5em;
}

thead {
  border-bottom: 2px solid #ccc;
}

tbody th:first-child {
  border-right: 2px solid #ccc;
}

tbody tr:nth-child(2n - 1) {
  background: #ececec;
}

thead tr,
tbody tr:nth-child(2n) {
  background: #f8f8f8;
}
</style>
