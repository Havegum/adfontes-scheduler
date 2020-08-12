<script>
export let promise;

promise.then(() => loading = false).catch(() => error = true);

let loading = true;
let error = false;
</script>

<div class="loader" class:loading class:error>
  <div class="dot" class:loaded={!loading}/>
  <p><slot>Sheet</slot></p>
</div>

<style>
.loader {
  display: flex;
  align-items: baseline;
}

.loading {
  animation: fader 500ms ease-in-out infinite alternate-reverse;
  color: gray;
}

.dot {
  width: .75em;
  height: .75em;
  border-radius: 50%;
  background-color: lightgray;
  transition: background-color 200ms;
}

.loaded {
  background-color: darkgreen;
}

.error {
  animation: none;
  color: #d93914;
}

.error .dot{
  background-color: #d93914;
}

@keyframes fader {
  from { opacity: 1 }
  to { opacity: 0.4 }
}
</style>
