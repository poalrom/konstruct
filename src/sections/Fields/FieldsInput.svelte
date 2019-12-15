<script>
  import { store } from "../../store";
  import { template } from "../../utils/template";

  export let blockId, field;

  const name = `${blockId}-${field.id}`;
  const value = store[blockId + "." + field.id];

  function handleInput(e) {
    store[blockId + "." + field.id].set(e.target.value);
  }
</script>

<div class="Fields-Input">
  {#if field.title}
    <label for="name" class="Fields-InputLabel">
      {@html template(field.title)}
    </label>
  {/if}

  <input
    {...field.attributes}
    class="Fields-InputField"
    {name}
    value={$value}
    on:input={handleInput} />
</div>
