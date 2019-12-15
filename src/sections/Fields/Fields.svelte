<script>
  import FieldsInput from "./FieldsInput.svelte";
  import { template } from "../../utils/template";
  
  export let block;
</script>

<div class="Fields">
  {#if block.title}
    <h2 class="Fields-Title">
      {@html block.title}
    </h2>
  {/if}

  {#if block.description}
    <p class="Fields-Description">
      {@html template(block.description)}
    </p>
  {/if}

  {#each block.fields as field}
    <FieldsInput blockId={block.id} {field} />
  {/each}
</div>
