import { get } from "svelte/store";
import { store } from "../store";

export function template(string) {
    return !store
        ? string
        : string
            .split(/[{}]/)
            .map((part, i) => {
                if (i % 2 && store[part]) {
                    return get(store[part]);
                }
                return part;
            })
            .join("");
}