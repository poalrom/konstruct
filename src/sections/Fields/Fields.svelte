<script>
  import FieldsInput from "./FieldsInput.svelte";
  export let block;
</script>

<div class="Contacts">
  <h2 class="Contacts-Header">{@html block.title}</h2>
  <p class="Contacts-Description">{@html block.description}</p>
  {#each block.fields as field} 
       <FieldsInput blockId={block.id} {field} />
  {/each}
</div>
