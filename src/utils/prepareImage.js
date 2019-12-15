import { get } from "svelte/store";
import { store, debug } from "../store";

export function prepareImage(img) {
    const imgPath = !store
        ? img
        : img
            .split(/[{}]/)
            .map((part, i) => {
                if (i % 2 && store[part]) {
                    return get(store[part]);
                }
                return part;
            })
            .join("");

    if (store[debug].placeholdImages) {
        return 'https://via.placeholder.com/350x200?text=' + imgPath;
    }

    return imgPath;
}