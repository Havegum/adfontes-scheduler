<script>
export let promise;

promise.then(() => loading = false).catch(() => error = true);

let loading = true;
let error = false;
</script>

<div class="loader" class:loading>
  <div class="dot" class:loaded={!loading} class:error></div>
  <p><slot>Sheet</slot></p>
</div>

<style>
.loader {
  display: flex;
}

.loading {
  animation: fader 250ms linear infinite alternate-reverse;
  color: gray;
}

.dot {
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background-color: lightgray;
}

.loaded {
  background-color: darkgreen;
}

.error {
  background-color: red;
}

@keyframes fader {
  from { opacity: 1 }
  to { opacity: 0.66 }
}
</style>
