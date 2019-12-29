<script>
  import { store } from "../../store";
  import SelectValue from "./SelectValue.svelte";
  import { prepareImage } from "../../utils/prepareImage";
  import { template } from "../../utils/template";

  export let block;

  const storedValue = store[block.id];
  $: currentValue = block.values.find(value => value.value === $storedValue);
</script>

<div class="Select" data-id={block.id}>

  {#if block.title}
    <h2 class="Select-Title">
      {@html block.title}
    </h2>
  {/if}

  {#if block.description}
    <p class="Select-Description">
      {@html template(block.description)}
    </p>
  {/if}

  <input type="hidden" value={$storedValue} name={block.title + block.id} />

  {#each block.values as value}
    <SelectValue {value} id={block.id} showImage={block.showImages} />
  {/each}

  {#if !block.showImages && currentValue && currentValue.img}
    <img
      src={prepareImage(currentValue.img)}
      class="Select-Image"
      alt={currentValue.text || currentValue.value} />
  {/if}

</div>
