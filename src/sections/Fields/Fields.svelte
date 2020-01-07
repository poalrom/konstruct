<script>
  import { createEventDispatcher } from 'svelte';
  import FieldsInput from "./FieldsInput.svelte";
  import { template } from "../../utils/template";

  const dispatch = createEventDispatcher();

  export let block;
</script>

<div class="Fields" data-id={block.id}>
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

  {#if block.nextStepButtonText}
    <button type="button" class="Fields-NextStepButton" on:click={() => dispatch('update')}>{block.nextStepButtonText}</button>
  {/if}
</div>
