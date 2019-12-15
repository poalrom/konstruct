import { writable, get } from 'svelte/store';

export let store;

export const debug = Symbol('debug');

export function initStore(config, onUpdate) {
    store = config.blocks.reduce((acc, block) => {
        if (block.type === 'select') {
            acc[block.id] = writable(block.values[0].value);
            acc[block.id].subscribe(onUpdate);
            if (config.debug && config.debug.logUpdates) {
                acc[block.id].subscribe((value) => console.log(block.id + ': ' + value));
            }
        }

        if (block.type === 'fields') {
            block.fields.forEach((field) => {
                const id = block.id + '.' + field.id;
                acc[id] = writable(field.attributes && field.attributes.value || '');
                acc[id].subscribe(onUpdate);
                if (config.debug && config.debug.logUpdates) {
                    acc[id].subscribe((value) => console.log(id + ': ' + value));
                }
            });
        }

        return acc;
    }, {});

    store[debug] = config.debug || {};

    store.getValues = function (visibleBlocks) {
        return visibleBlocks.reduce((acc, block) => {
            if (block.type === 'select') {
                const storedValue = get(store[block.id]);
                const selectedValue = block.values.find((val) => val.value === storedValue);
                acc[block.title] = selectedValue.text || selectedValue.value;
            }

            if (block.type === 'fields') {
                acc[block.title] = {};
                block.fields.forEach((field) => {
                    acc[block.title][field.title] = get(store[block.id + '.' + field.id]);
                });
            }

            return acc;
        }, {})
    }
}