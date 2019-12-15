<script>
  import FieldsInput from "./FieldsInput.svelte";
  export let block;
</script>

<div class="Fields">
  <h2 class="Fields-Header">{@html block.title}</h2>
  <p class="Fields-Description">{@html block.description}</p>
  {#each block.fields as field} 
       <FieldsInput blockId={block.id} {field} />
  {/each}
</div>
