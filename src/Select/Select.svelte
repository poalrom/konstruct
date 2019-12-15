<script>
  import { get } from "svelte/store";
  import { store, debug } from "../store";
  import SelectValue from "./SelectValue.svelte";

  export let block;

  const storedValue = store[block.id];
  $: currentValue = block.values.find(value => value.value === $storedValue);

  function prepareImage(img) {
    const imgPath = !store
      ? img
      : img
          .split(/[{}]/)
          .map((part, i) => {
            if (i % 2 && store[part]) {
              return get(store[part]);
            }
            return part;
          })
          .join("");

    if (store[debug].placeholdImages) {
      return 'https://via.placeholder.com/350x200?text=' + imgPath;
    }

    return imgPath;
  }
</script>

<div class="Select">

  <h2 class="Select-Title">{block.title}</h2>

  <p class="Select-Description">{block.description}</p>

  <input type="hidden" value={$storedValue} name={block.title} />

  {#each block.values as value}
    <SelectValue {value} id={block.id} />
  {/each}

  {#if currentValue && currentValue.img}
    <img
      src={prepareImage(currentValue.img)}
      class="Select-Image"
      alt={currentValue.text || currentValue.value} />
  {/if}

</div>
