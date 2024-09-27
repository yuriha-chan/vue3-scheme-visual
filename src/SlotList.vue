<script setup>
import NodeTree from './NodeTree.vue'
import Syntax from './Syntax.ts'
import builtins from './Builtin.ts'
import parse from './Parser.js'
</script>

<template>
  <div class="slotlists">
    <div v-for="(item, i) in items" class="entry" :key="item.index">
      <div class="slot-container" :class="[item.type]">
        <svg viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"  @click.right.prevent="onRClick(i)">
          <path v-if="item.type == 'clause'" d='M 0 -8 L 0 8 M 0 0 L 10 0'/>
          <circle v-else cx="0" cy="0" r="7"
            :class="[item.assignment ? 'attached' : 'empty']"
            @click="onClick(i)"/>
        </svg>
        <div v-if="i != items.length-1" class="slot-filler"/>
      </div>
      <div v-if="item.type == 'ellipsis'" class="value-container ellipsis-label" @click="onClick(i)">
        expand list…
      </div>
      <div v-else-if="item.editing">
        <input v-model="inputs[i]" :placeholder="item.template.placeholder" @keydown.enter="onClick(i)" :ref="(r) => {inputRefs[i] = r;}" />
      </div>
      <div v-else-if="item.assignment" class="value-container">
        <NodeTree :editorState="editorState" :node="item.assignment"/>
      </div>
      <div v-else class="value-container placeholder" @click="onClick(i)">
        {{ item.template.placeholder ?? "add node ..."}}
      </div>
    </div>
  </div>
</template>

<script>

const valuesToAssignment = (values) =>
  { let selected = values[0] && values[0].type === 'symbol' && builtins[values[0].value];
    let args;
    if (selected) {
      args = values.slice(1);
    } else {
      selected = builtins["empty list"];
      args = values;
    }
    const slots = Syntax.generateAll(selected);
    args.forEach((v, i) => {
        const item = slots[i];
        if (item.type == "ellipsis") {
          let instance = Syntax.generate(item.template);
          instance.expanded = true;
          instance.assignment = valueToAssignment(v);
          slots.splice(i, 0, instance);
        } else {
          slots[i].assignment = valueToAssignment(v);
          // TODO: or assigned
        }
      });
    const ret = { type: selected.type, label: selected.label, value: selected.value, slots: slots };
    return ret;
  };

const valueToAssignment = (s) =>
  (s.type === "number") ?
    { ...s, label: "" + s.value } :
  (s.type === "symbol") ?
    { ...s, label: "" + s.value } :
  (s.type === "list") ?
    valuesToAssignment(s.value) :
  null;

export default {
  data() {
    return {
      items: this.values,
      inputs: this.values.map(() => ""),
      inputRefs: [],
    };
  },
  props: ["values", "editorState"],
  methods: {
    async onClick(i) {
      let item = this.items[i];
      if (item.type == "ellipsis") {
        let instance = Syntax.generate(item.template);
        instance.expanded = true;
        this.items.splice(i, 0, instance);
      } else if (item.type == 'symbol') {
        await (item.editing = !item.editing);
        if (item.editing) {
          this.inputRefs[i].focus();
        } else {
          let s = "" + this.inputs[i];
          item.assignment = { type: "symbol", value: s, label: s };
        }
      } else if (!item.assignment) {
        let selected = this.editorState.selectedItem;
        if (selected) {
          let slots = Syntax.generateAll(selected);
          item.assignment = { type: selected.type, label: selected.label, value: selected.value, slots: slots };
          this.editorState.selectedItem = null;
        } else {          
          await (item.editing = !item.editing);
          if (item.editing) {
            this.inputRefs[i].focus();
          } else {
            let s = parse("" + this.inputs[i]);
            item.assignment = valueToAssignment(s);
          }
        }
      }
      console.log(this.items)
    },
    onRClick(i) {
      let item = this.items[i];
      if (item.ellipsis) {
        return;
      }
      if (item.expanded) {
        console.log(i);
        this.items.splice(i, 1);
      } else {
        this.items.splice(i, 1, Syntax.generate(item.template) );
      }
    }
  }
}
</script>
<style>
.slotlists {
  padding: 2px 0 0;
}
svg {
  margin: 4px 0 0;
}
circle.empty {
  fill: #f3f3f3;
  stroke-width: 2px;
  stroke-dasharray: 4px 4px;
  stroke: #555;
}
.symbol circle.empty {
  fill: #e8ffe8;
  stroke-width: 2px;
  stroke-dasharray: 4px 4px;
  stroke: #5a5;
}
.literal, input {
  font-family: "DejaVu Sans Mono", monospace, monospace;
}
.symbol.literal {
  color: #3a3;
  font-weight: bold;
  padding: 3px 0.6em 3px;
}
.value circle.attached {
  fill: #99c;
}
.symbol circle.attached {
  fill: #ccffcc;
  stroke-width: 2px;
  stroke: #5a5;
}
.ellipsis circle {
  fill: #eee;
  stroke: #888;
  stroke-dasharray: none;
}
path {
  fill: none;
  stroke: #888;
}
.entry {
  display: flex;
}
.slot-container{
  display: flex;
  flex-direction: column;
}
.slot-filler {
  width: 0;
  border-left: 2px solid #ccc;
  flex-grow: 1;
  position: relative;
  left: 8.5px;
  margin: -2px 0 -6px;
}
.ellipsis-label {
  color: #555;  
  padding-left: 0.6em;
}
.value-container {
  padding-bottom: 0.4em;
}
.placeholder {
  color: #999;
  font-style: italic;
  padding-left: 0.6em;
}
</style>
