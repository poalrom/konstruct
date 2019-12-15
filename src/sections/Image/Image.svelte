<script>
  import { prepareImage } from "../../utils/prepareImage";
  import { template } from "../../utils/template";

  export let block;

  $: imagePath = prepareImage(block.img);
</script>

<div class="Image">

  {#if block.title}
    <h2 class="Image-Title">
      {@html block.title}
    </h2>
  {/if}

  {#if block.description}
    <p class="Image-Description">
      {@html template(block.description)}
    </p>
  {/if}

  <img
    src={imagePath}
    class="Select-Image"
    alt={block.alt || imagePath}
    {...block.attributes} />

</div>
