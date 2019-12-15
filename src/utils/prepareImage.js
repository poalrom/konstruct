import { store, debug } from "../store";
import { template } from './template';

export function prepareImage(img) {
    const imagePath = template(img);

    return store[debug].placeholdImages
        ? "https://via.placeholder.com/350x200?text=" + imagePath
        : imagePath;
}