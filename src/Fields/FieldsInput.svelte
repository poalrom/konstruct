<script>
  import { store } from "../store";
  export let blockId, field;

  const name = `${blockId}-${field.id}`;
  const value = store[blockId + "." + field.id];

  function handleInput(e) {
    value.set(e.target.value);
  }
</script>

<div class="Fields-Input">
  <label for="name" class="Fields-InputLabel">{field.title}</label>
  <input
    {...field.attributes}
    class="Fields-InputField"
    {name}
    value={$value}
    on:input={handleInput} />
</div>
