<script>
  import { prepareImage } from "../../utils/prepareImage";

  export let block;

  $: imagePath = prepareImage(block.img);
</script>

<div class="Image">

  <h2 class="Image-Title">
    {@html block.title}
  </h2>

  <p class="Image-Description">
    {@html block.description}
  </p>

  <img
    src={imagePath}
    class="Select-Image"
    alt={block.alt || imagePath}
    {...block.attributes} />

</div>
