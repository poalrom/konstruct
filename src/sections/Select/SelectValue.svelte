<script>
  import { store } from "../../store";
  import { prepareImage } from "../../utils/prepareImage";

  export let id, value, showImage;

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
  {#if showImage && value.img}
    <img
      src={prepareImage(value.img)}
      class="Select-ValueImage"
      alt={value.text || value.value} />
  {/if}
  <p class="Select-ValueText">
    {@html value.text || value.value}
  </p>
</div>
