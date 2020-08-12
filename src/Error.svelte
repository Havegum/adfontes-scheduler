<script>
export let err = {};
</script>

{#if 400 <= err.status && err.status < 500}
  <p class="error">
    Something went wrong and it was <strong>probably my mistake</strong>. If the error persists, send me a message with the following:
  </p>
  <code class="error">{err.status}: {err.statusText}</code>
{:else if 500 <= err.status && err.status < 600}
  <p class="error">
    Something went wrong at the server we're fetching data from. If refreshing doesn't work, send me a message with the following:
  </p>
  <code class="error">{err.status}: {err.statusText}</code>

{:else if err.message}
  <p class="error">
    Something went wrong and it was <strong>probably my mistake</strong>. If the error persists, send me a message with the following:
  </p>
  <code class="error">{err.message}</code>
{:else}
  <p class="error">
    This is an unexpected error, if you're seeing this please send me a message with the following:
  </p>
  <code class="error">
    {#if err.status !== undefined}
      {err.status}: {err.statusText}
    {:else}
      {JSON.stringify(err)}
    {/if}
  </code>
{/if}


<style>
.error {
	margin-top: 1.4rem;
}

code.error {
	font-size: 2em;
	font-family: inherit;
	color: #d93914;
}
</style>
