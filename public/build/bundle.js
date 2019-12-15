
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let store;

    const debug = Symbol('debug');

    function initStore(config, onUpdate) {
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
                    console.log(id);
                    acc[id] = writable(block.attributes && block.attributes.value || '');
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
                    const storedValue = get_store_value(store[block.id]);
                    const selectedValue = block.values.find((val) => val.value === storedValue);
                    acc[block.title] = selectedValue.text || selectedValue.value;
                }

                if (block.type === 'fields') {
                    acc[block.title] = {};
                    block.fields.forEach((field) => {
                        acc[block.title][field.title] = get_store_value(store[block.id + '.' + field.id]);
                    });
                }

                return acc;
            }, {})
        };
    }

    /* src\sections\Select\SelectValue.svelte generated by Svelte v3.16.0 */
    const file = "src\\sections\\Select\\SelectValue.svelte";

    function create_fragment(ctx) {
    	let div;
    	let raw_value = (/*value*/ ctx[0].text || /*value*/ ctx[0].value) + "";
    	let div_data_value_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "Select-Value");
    			attr_dev(div, "data-value", div_data_value_value = /*value*/ ctx[0].value);
    			toggle_class(div, "active", /*active*/ ctx[1]);
    			add_location(div, file, 13, 0, 237);
    			dispose = listen_dev(div, "click", /*setValue*/ ctx[3](/*value*/ ctx[0].value), false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1 && raw_value !== (raw_value = (/*value*/ ctx[0].text || /*value*/ ctx[0].value) + "")) div.innerHTML = raw_value;
    			if (dirty & /*value*/ 1 && div_data_value_value !== (div_data_value_value = /*value*/ ctx[0].value)) {
    				attr_dev(div, "data-value", div_data_value_value);
    			}

    			if (dirty & /*active*/ 2) {
    				toggle_class(div, "active", /*active*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $storedValue;
    	let { id } = $$props, { value } = $$props;
    	const storedValue = store[id];
    	validate_store(storedValue, "storedValue");
    	component_subscribe($$self, storedValue, value => $$invalidate(5, $storedValue = value));

    	function setValue(value) {
    		return () => storedValue.set(value);
    	}

    	const writable_props = ["id", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectValue> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => {
    		return { id, value, active, $storedValue };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("$storedValue" in $$props) storedValue.set($storedValue = $$props.$storedValue);
    	};

    	let active;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$storedValue, value*/ 33) {
    			 $$invalidate(1, active = $storedValue === value.value);
    		}
    	};

    	return [value, active, storedValue, setValue, id];
    }

    class SelectValue extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 4, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectValue",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console.warn("<SelectValue> was created without expected prop 'id'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<SelectValue> was created without expected prop 'value'");
    		}
    	}

    	get id() {
    		throw new Error("<SelectValue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SelectValue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SelectValue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectValue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function template(string) {
        return !store
            ? string
            : string
                .split(/[{}]/)
                .map((part, i) => {
                    if (i % 2 && store[part]) {
                        return get_store_value(store[part]);
                    }
                    return part;
                })
                .join("");
    }

    function prepareImage(img) {
        const imagePath = template(img);

        return store[debug].placeholdImages
            ? "https://via.placeholder.com/350x200?text=" + imagePath
            : imagePath;
    }

    /* src\sections\Select\Select.svelte generated by Svelte v3.16.0 */
    const file$1 = "src\\sections\\Select\\Select.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (15:2) {#if block.title}
    function create_if_block_2(ctx) {
    	let h2;
    	let raw_value = /*block*/ ctx[0].title + "";

    	const block_1 = {
    		c: function create() {
    			h2 = element("h2");
    			attr_dev(h2, "class", "Select-Title");
    			add_location(h2, file$1, 15, 4, 423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			h2.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = /*block*/ ctx[0].title + "")) h2.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(15:2) {#if block.title}",
    		ctx
    	});

    	return block_1;
    }

    // (21:2) {#if block.description}
    function create_if_block_1(ctx) {
    	let p;
    	let raw_value = template(/*block*/ ctx[0].description) + "";

    	const block_1 = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "Select-Description");
    			add_location(p, file$1, 21, 4, 524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = template(/*block*/ ctx[0].description) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:2) {#if block.description}",
    		ctx
    	});

    	return block_1;
    }

    // (29:2) {#each block.values as value}
    function create_each_block(ctx) {
    	let current;

    	const selectvalue = new SelectValue({
    			props: {
    				value: /*value*/ ctx[4],
    				id: /*block*/ ctx[0].id
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(selectvalue.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectvalue, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectvalue_changes = {};
    			if (dirty & /*block*/ 1) selectvalue_changes.value = /*value*/ ctx[4];
    			if (dirty & /*block*/ 1) selectvalue_changes.id = /*block*/ ctx[0].id;
    			selectvalue.$set(selectvalue_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectvalue.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectvalue.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectvalue, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:2) {#each block.values as value}",
    		ctx
    	});

    	return block_1;
    }

    // (33:2) {#if currentValue && currentValue.img}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block_1 = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = prepareImage(/*currentValue*/ ctx[1].img))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "Select-Image");
    			attr_dev(img, "alt", img_alt_value = /*currentValue*/ ctx[1].text || /*currentValue*/ ctx[1].value);
    			add_location(img, file$1, 33, 4, 823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentValue*/ 2 && img.src !== (img_src_value = prepareImage(/*currentValue*/ ctx[1].img))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*currentValue*/ 2 && img_alt_value !== (img_alt_value = /*currentValue*/ ctx[1].text || /*currentValue*/ ctx[1].value)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:2) {#if currentValue && currentValue.img}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let input;
    	let input_name_value;
    	let t2;
    	let t3;
    	let div_data_id_value;
    	let current;
    	let if_block0 = /*block*/ ctx[0].title && create_if_block_2(ctx);
    	let if_block1 = /*block*/ ctx[0].description && create_if_block_1(ctx);
    	let each_value = /*block*/ ctx[0].values;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block2 = /*currentValue*/ ctx[1] && /*currentValue*/ ctx[1].img && create_if_block(ctx);

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			input = element("input");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(input, "type", "hidden");
    			input.value = /*$storedValue*/ ctx[2];
    			attr_dev(input, "name", input_name_value = /*block*/ ctx[0].title + /*block*/ ctx[0].id);
    			add_location(input, file$1, 26, 2, 617);
    			attr_dev(div, "class", "Select");
    			attr_dev(div, "data-id", div_data_id_value = /*block*/ ctx[0].id);
    			add_location(div, file$1, 12, 0, 358);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, input);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*block*/ ctx[0].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*block*/ ctx[0].description) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*$storedValue*/ 4) {
    				prop_dev(input, "value", /*$storedValue*/ ctx[2]);
    			}

    			if (!current || dirty & /*block*/ 1 && input_name_value !== (input_name_value = /*block*/ ctx[0].title + /*block*/ ctx[0].id)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*block*/ 1) {
    				each_value = /*block*/ ctx[0].values;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*currentValue*/ ctx[1] && /*currentValue*/ ctx[1].img) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*block*/ 1 && div_data_id_value !== (div_data_id_value = /*block*/ ctx[0].id)) {
    				attr_dev(div, "data-id", div_data_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $storedValue;
    	let { block } = $$props;
    	const storedValue = store[block.id];
    	validate_store(storedValue, "storedValue");
    	component_subscribe($$self, storedValue, value => $$invalidate(2, $storedValue = value));
    	const writable_props = ["block"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    	};

    	$$self.$capture_state = () => {
    		return { block, currentValue, $storedValue };
    	};

    	$$self.$inject_state = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    		if ("currentValue" in $$props) $$invalidate(1, currentValue = $$props.currentValue);
    		if ("$storedValue" in $$props) storedValue.set($storedValue = $$props.$storedValue);
    	};

    	let currentValue;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*block, $storedValue*/ 5) {
    			 $$invalidate(1, currentValue = block.values.find(value => value.value === $storedValue));
    		}
    	};

    	return [block, currentValue, $storedValue, storedValue];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { block: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*block*/ ctx[0] === undefined && !("block" in props)) {
    			console.warn("<Select> was created without expected prop 'block'");
    		}
    	}

    	get block() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\sections\Fields\FieldsInput.svelte generated by Svelte v3.16.0 */
    const file$2 = "src\\sections\\Fields\\FieldsInput.svelte";

    // (16:2) {#if field.title}
    function create_if_block$1(ctx) {
    	let label;
    	let raw_value = template(/*field*/ ctx[0].title) + "";

    	const block = {
    		c: function create() {
    			label = element("label");
    			attr_dev(label, "for", "name");
    			attr_dev(label, "class", "Fields-InputLabel");
    			add_location(label, file$2, 16, 4, 372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			label.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field*/ 1 && raw_value !== (raw_value = template(/*field*/ ctx[0].title) + "")) label.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(16:2) {#if field.title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t;
    	let input;
    	let dispose;
    	let if_block = /*field*/ ctx[0].title && create_if_block$1(ctx);

    	let input_levels = [
    		/*field*/ ctx[0].attributes,
    		{ class: "Fields-InputField" },
    		{ name: /*name*/ ctx[2] },
    		{ value: /*$value*/ ctx[1] }
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$2, 21, 2, 477);
    			attr_dev(div, "class", "Fields-Input");
    			add_location(div, file$2, 14, 0, 321);
    			dispose = listen_dev(input, "input", /*handleInput*/ ctx[3], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, input);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*field*/ ctx[0].title) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_attributes(input, get_spread_update(input_levels, [
    				dirty & /*field*/ 1 && /*field*/ ctx[0].attributes,
    				{ class: "Fields-InputField" },
    				dirty & /*name*/ 4 && ({ name: /*name*/ ctx[2] }),
    				dirty & /*$value*/ 2 && ({ value: /*$value*/ ctx[1] })
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $value;
    	let { blockId } = $$props, { field } = $$props;
    	const name = `${blockId}-${field.id}`;
    	const value = store[blockId + "." + field.id];
    	validate_store(value, "value");
    	component_subscribe($$self, value, value => $$invalidate(1, $value = value));

    	function handleInput(e) {
    		store[blockId + "." + field.id].set(e.target.value);
    	}

    	const writable_props = ["blockId", "field"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FieldsInput> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("blockId" in $$props) $$invalidate(4, blockId = $$props.blockId);
    		if ("field" in $$props) $$invalidate(0, field = $$props.field);
    	};

    	$$self.$capture_state = () => {
    		return { blockId, field, $value };
    	};

    	$$self.$inject_state = $$props => {
    		if ("blockId" in $$props) $$invalidate(4, blockId = $$props.blockId);
    		if ("field" in $$props) $$invalidate(0, field = $$props.field);
    		if ("$value" in $$props) value.set($value = $$props.$value);
    	};

    	return [field, $value, name, handleInput, blockId];
    }

    class FieldsInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { blockId: 4, field: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FieldsInput",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*blockId*/ ctx[4] === undefined && !("blockId" in props)) {
    			console.warn("<FieldsInput> was created without expected prop 'blockId'");
    		}

    		if (/*field*/ ctx[0] === undefined && !("field" in props)) {
    			console.warn("<FieldsInput> was created without expected prop 'field'");
    		}
    	}

    	get blockId() {
    		throw new Error("<FieldsInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blockId(value) {
    		throw new Error("<FieldsInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get field() {
    		throw new Error("<FieldsInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set field(value) {
    		throw new Error("<FieldsInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\sections\Fields\Fields.svelte generated by Svelte v3.16.0 */
    const file$3 = "src\\sections\\Fields\\Fields.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:2) {#if block.title}
    function create_if_block_1$1(ctx) {
    	let h2;
    	let raw_value = /*block*/ ctx[0].title + "";

    	const block_1 = {
    		c: function create() {
    			h2 = element("h2");
    			attr_dev(h2, "class", "Fields-Title");
    			add_location(h2, file$3, 9, 4, 189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			h2.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = /*block*/ ctx[0].title + "")) h2.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(9:2) {#if block.title}",
    		ctx
    	});

    	return block_1;
    }

    // (15:2) {#if block.description}
    function create_if_block$2(ctx) {
    	let p;
    	let raw_value = template(/*block*/ ctx[0].description) + "";

    	const block_1 = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "Fields-Description");
    			add_location(p, file$3, 15, 4, 290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = template(/*block*/ ctx[0].description) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:2) {#if block.description}",
    		ctx
    	});

    	return block_1;
    }

    // (21:2) {#each block.fields as field}
    function create_each_block$1(ctx) {
    	let current;

    	const fieldsinput = new FieldsInput({
    			props: {
    				blockId: /*block*/ ctx[0].id,
    				field: /*field*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(fieldsinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fieldsinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fieldsinput_changes = {};
    			if (dirty & /*block*/ 1) fieldsinput_changes.blockId = /*block*/ ctx[0].id;
    			if (dirty & /*block*/ 1) fieldsinput_changes.field = /*field*/ ctx[1];
    			fieldsinput.$set(fieldsinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fieldsinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fieldsinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fieldsinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(21:2) {#each block.fields as field}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let if_block0 = /*block*/ ctx[0].title && create_if_block_1$1(ctx);
    	let if_block1 = /*block*/ ctx[0].description && create_if_block$2(ctx);
    	let each_value = /*block*/ ctx[0].fields;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "Fields");
    			add_location(div, file$3, 7, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*block*/ ctx[0].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*block*/ ctx[0].description) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*block*/ 1) {
    				each_value = /*block*/ ctx[0].fields;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { block } = $$props;
    	const writable_props = ["block"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fields> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    	};

    	$$self.$capture_state = () => {
    		return { block };
    	};

    	$$self.$inject_state = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    	};

    	return [block];
    }

    class Fields extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { block: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fields",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*block*/ ctx[0] === undefined && !("block" in props)) {
    			console.warn("<Fields> was created without expected prop 'block'");
    		}
    	}

    	get block() {
    		throw new Error("<Fields>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Fields>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\sections\Image\Image.svelte generated by Svelte v3.16.0 */
    const file$4 = "src\\sections\\Image\\Image.svelte";

    // (12:2) {#if block.title}
    function create_if_block_1$2(ctx) {
    	let h2;
    	let raw_value = /*block*/ ctx[0].title + "";

    	const block_1 = {
    		c: function create() {
    			h2 = element("h2");
    			attr_dev(h2, "class", "Image-Title");
    			add_location(h2, file$4, 12, 4, 239);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			h2.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = /*block*/ ctx[0].title + "")) h2.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(12:2) {#if block.title}",
    		ctx
    	});

    	return block_1;
    }

    // (18:2) {#if block.description}
    function create_if_block$3(ctx) {
    	let p;
    	let raw_value = template(/*block*/ ctx[0].description) + "";

    	const block_1 = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "Image-Description");
    			add_location(p, file$4, 18, 4, 339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*block*/ 1 && raw_value !== (raw_value = template(/*block*/ ctx[0].description) + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(18:2) {#if block.description}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let img;
    	let if_block0 = /*block*/ ctx[0].title && create_if_block_1$2(ctx);
    	let if_block1 = /*block*/ ctx[0].description && create_if_block$3(ctx);

    	let img_levels = [
    		{ src: /*imagePath*/ ctx[1] },
    		{ class: "Select-Image" },
    		{
    			alt: /*block*/ ctx[0].alt || /*imagePath*/ ctx[1]
    		},
    		/*block*/ ctx[0].attributes
    	];

    	let img_data = {};

    	for (let i = 0; i < img_levels.length; i += 1) {
    		img_data = assign(img_data, img_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			img = element("img");
    			set_attributes(img, img_data);
    			add_location(img, file$4, 23, 2, 431);
    			attr_dev(div, "class", "Image");
    			add_location(div, file$4, 9, 0, 194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*block*/ ctx[0].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*block*/ ctx[0].description) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			set_attributes(img, get_spread_update(img_levels, [
    				dirty & /*imagePath*/ 2 && ({ src: /*imagePath*/ ctx[1] }),
    				{ class: "Select-Image" },
    				dirty & /*block, imagePath*/ 3 && ({
    					alt: /*block*/ ctx[0].alt || /*imagePath*/ ctx[1]
    				}),
    				dirty & /*block*/ 1 && /*block*/ ctx[0].attributes
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { block } = $$props;
    	const writable_props = ["block"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    	};

    	$$self.$capture_state = () => {
    		return { block, imagePath };
    	};

    	$$self.$inject_state = $$props => {
    		if ("block" in $$props) $$invalidate(0, block = $$props.block);
    		if ("imagePath" in $$props) $$invalidate(1, imagePath = $$props.imagePath);
    	};

    	let imagePath;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*block*/ 1) {
    			 $$invalidate(1, imagePath = prepareImage(block.img));
    		}
    	};

    	return [block, imagePath];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { block: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*block*/ ctx[0] === undefined && !("block" in props)) {
    			console.warn("<Image> was created without expected prop 'block'");
    		}
    	}

    	get block() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.16.0 */
    const file$5 = "src\\App.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (49:4) {#if block.type === 'select'}
    function create_if_block_2$1(ctx) {
    	let current;

    	const select = new Select({
    			props: { block: /*block*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*visibleBlocks*/ 2) select_changes.block = /*block*/ ctx[4];
    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(49:4) {#if block.type === 'select'}",
    		ctx
    	});

    	return block;
    }

    // (52:4) {#if block.type === 'fields'}
    function create_if_block_1$3(ctx) {
    	let current;

    	const fields = new Fields({
    			props: { block: /*block*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(fields.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fields, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fields_changes = {};
    			if (dirty & /*visibleBlocks*/ 2) fields_changes.block = /*block*/ ctx[4];
    			fields.$set(fields_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fields.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fields.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fields, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(52:4) {#if block.type === 'fields'}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if block.type === 'image'}
    function create_if_block$4(ctx) {
    	let current;

    	const image = new Image({
    			props: { block: /*block*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const image_changes = {};
    			if (dirty & /*visibleBlocks*/ 2) image_changes.block = /*block*/ ctx[4];
    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(55:4) {#if block.type === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#each visibleBlocks as block}
    function create_each_block$2(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*block*/ ctx[4].type === "select" && create_if_block_2$1(ctx);
    	let if_block1 = /*block*/ ctx[4].type === "fields" && create_if_block_1$3(ctx);
    	let if_block2 = /*block*/ ctx[4].type === "image" && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*block*/ ctx[4].type === "select") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*block*/ ctx[4].type === "fields") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*block*/ ctx[4].type === "image") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(48:2) {#each visibleBlocks as block}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let form;
    	let t0;
    	let button;
    	let t1_value = (/*config*/ ctx[0].saveButtonText || "") + "";
    	let t1;
    	let form_action_value;
    	let current;
    	let dispose;
    	let each_value = /*visibleBlocks*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			form = element("form");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			t1 = text(t1_value);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "SubmitButton");
    			add_location(button, file$5, 59, 2, 1313);
    			attr_dev(form, "action", form_action_value = /*config*/ ctx[0].action);
    			attr_dev(form, "method", "POST");
    			add_location(form, file$5, 46, 0, 999);
    			dispose = listen_dev(form, "submit", /*submit*/ ctx[2], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			append_dev(form, t0);
    			append_dev(form, button);
    			append_dev(button, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visibleBlocks*/ 2) {
    				each_value = /*visibleBlocks*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(form, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*config*/ 1) && t1_value !== (t1_value = (/*config*/ ctx[0].saveButtonText || "") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*config*/ 1 && form_action_value !== (form_action_value = /*config*/ ctx[0].action)) {
    				attr_dev(form, "action", form_action_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { config } = $$props;
    	initStore(config, setVisibleBlocks);

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

    	let visibleBlocks = [];

    	function setVisibleBlocks() {
    		if (!store) {
    			return;
    		}

    		$$invalidate(1, visibleBlocks = config.blocks.filter(block => {
    			if (!block.conditions) {
    				return true;
    			}

    			return block.conditions.reduce(
    				(acc, condition) => {
    					if (get_store_value(store[condition.id]) !== condition.value) {
    						return false;
    					}

    					return acc;
    				},
    				true
    			);
    		}));
    	}

    	setVisibleBlocks();
    	const writable_props = ["config"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => {
    		return { config, visibleBlocks };
    	};

    	$$self.$inject_state = $$props => {
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    		if ("visibleBlocks" in $$props) $$invalidate(1, visibleBlocks = $$props.visibleBlocks);
    	};

    	return [config, visibleBlocks, submit];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*config*/ ctx[0] === undefined && !("config" in props)) {
    			console.warn("<App> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const expectedBlocks = ['fields', 'select', 'image'];

    function configValidator(config) {
        config.blocks.forEach(validateBlock);
    }

    function validateBlock(block, i, blocks) {
        if (!expectedBlocks.includes(block.type)) {
            throw new Error('Only expected blocks must be present. Unexpected block has type ' + block.type);
        }
        if (!block.id) {
            throw new Error('All blocks must have ids. Block with index ' + i + ' dont has it');
        }
        if (typeof block.id !== 'string') {
            throw new Error('Block id must be a string');
        }
        if (block.id.indexOf('.') >= 0) {
            throw new Error('Block id must not include dot (.)');
        }
        try {
            hasDuplicates(block, i, blocks);
        } catch (e) {
            throw new Error('Blocks ids must be unique. Not unique id: ' + e.message);
        }
        if (block.type === 'fields') {
            try {
                block.fields.forEach(hasDuplicates);
            } catch (e) {
                throw new Error('Fields ids must be unique. Not unique id: ' + e.message);
            }
        }
    }

    function hasDuplicates(block, i, blocks) {
        if (blocks.slice(i + 1).some(({id}) => id === block.id)) {
            throw new Error(block.id);
        }
    }

    window.konstruct = {
    	render(selector, config) {
    		const el = document.querySelector(selector);
    		if (!el) {
    			throw new Error(`Element ${selector} not present in DOM`);
    		}
    		configValidator(config);
    		new App({
    			target: el,
    			props: { config }
    		});
    	}
    };

}());
//# sourceMappingURL=bundle.js.map
