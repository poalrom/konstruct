<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { initStore, store } from "./store";
  import Select from "./sections/Select/Select.svelte";
  import Fields from "./sections/Fields/Fields.svelte";
  import Image from "./sections/Image/Image.svelte";

  export let config;
  let konstuct;

  initStore(config, onUpdate);

  function submit(e) {
    if (config.onSubmit) {
      e.preventDefault();

      if (this.checkValidity()) {
        config.onSubmit(store.getValues(visibleBlocks));
      } else {
        this.reportValidity();
      }
    }
  }

  $: visibleBlocks = [];

  function onUpdate(block, path) {
    return () => {
      setVisibleBlocks();
      dispatch('update', { blockId: block.id, blockType: block.type, path });
    }
  }

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

  function dispatch(name, detail = {}) {
    konstuct && konstuct.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }

  onMount(function(){
    setVisibleBlocks();
    dispatch('init');
  })
</script>

<form action={config.action} method="POST" on:submit={submit} class="Konstruct" bind:this={konstuct}>
  {#each visibleBlocks as block (block.id)}
    {#if block.type === 'select'}
      <Select {block} />
    {/if}
    {#if block.type === 'fields'}
      <Fields {block} on:update={onUpdate(block)} />
    {/if}
    {#if block.type === 'image'}
      <Image {block} />
    {/if}
  {/each}

  <div class="Submit">
    <button type="submit" class="Submit-Button">
      {config.saveButtonText || ''}
    </button>
  </div>
</form>
