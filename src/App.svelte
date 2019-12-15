<script>
  import { get } from "svelte/store";
  import { initStore, store } from "./store";
  import Select from "./Select/Select.svelte";
  import Fields from "./Fields/Fields.svelte";

  export let config;

  initStore(config, setVisibleBlocks);

  function submit(e) {
    e.preventDefault();

    if (this.checkValidity()) {
      console.log(store.getValues(visibleBlocks));
    } else {
      this.reportValidity();
    }
  }

  let visibleBlocks = [];

  function setVisibleBlocks() {
    if (!store) {
      return;
    }
    visibleBlocks = config.blocks.filter(block => {
      if (!block.conditions) {
        return true;
      }
      return block.conditions.reduce((acc, condition) => {
        if (get(store[condition.id]) !== condition.value) {
          return false;
        }

        return acc;
      }, true);
    });
  }

  setVisibleBlocks();
</script>

<form action={config.action} method="POST" on:submit={submit}>
  {#each visibleBlocks as block}
    {#if block.type === 'select'}
      <Select {block} />
    {/if}
    {#if block.type === 'fields'}
      <Fields {block} />
    {/if}
  {/each}

  <button type="submit" class="SubmitButton">
    {config.saveButtonText || ''}
  </button>
</form>
