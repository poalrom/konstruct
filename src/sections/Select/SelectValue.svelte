<script>
  import { store } from "../../store";

  export let id, value;

  const storedValue = store[id];
  $: active = $storedValue === value.value;

  function setValue(value) {
    return () => storedValue.set(value);
  }
</script>

<div
  class="Select-Value"
  class:active
  data-value={value.value}
  on:click={setValue(value.value)}>
  {@html value.text || value.value}
</div>
