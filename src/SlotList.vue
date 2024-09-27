<script setup>
import NodeTree from './NodeTree.vue'
import Syntax from './Syntax.ts'
import builtins from './Builtin.ts'
import parse from './Parser.js'
</script>

<template>
  <div class="slotlists" :class="rotate ? 'rotate' : 'vertical'">
    <div v-for="(item, i) in items.slice(j, rotate ? rotateIndex : undefined)" class="entry" :class="item.type" :key="item.index">
      <div class="slot-container">
        <svg viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"  @click.right.prevent="onRClick(i + j)">
          <path v-if="!rotate && item.type === 'clause'" d='M 0 -8 L 0 8 M 0 0 L 10 0'/>
          <path v-else-if="item.type === 'ellipsis'" class="ellipsis" d="M 0 -8 L 8 0 L 0 8 L -8 0 Z" @click="onClick(i + j)"/>
          <circle v-else cx="0" cy="0" r="7"
            :class="[item.assignment ? 'attached' : 'empty']"
            @click="onClick(i + j)"/>
        </svg>
        <div v-if="!rotate && i + j !== items.length-1" class="slot-filler"/>
      </div>
      <div v-if="item.type == 'ellipsis'" class="value-container ellipsis-label" @click="onClick(i + j)">…</div>
      <div v-else-if="item.editing" class="value-container">
        <input v-model="inputs[i + j]" :placeholder="item.template.placeholder" @keydown.enter="onClick(i + j)" :ref="(r) => {inputRefs[i + j] = r;}" />
      </div>
      <div v-else-if="item.assignment" :class="['value-container', item.assignment.type]">
        <NodeTree :editorState="editorState" :node="item.assignment"/>
      </div>
      <div v-else class="value-container placeholder" @click="onClick(i + j)">
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
  props: ["values", "rotate", "j", "rotateIndex", "editorState"],
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
  display: flex;
  flex-direction: column;
}
.slotlists.rotate {
  flex-direction: row;
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
.value-container {
  border-radius: 5px;
  border: 2px solid transparent;
  margin: 0 0 4px;
}
.entry.value > .value-container {
  background-color: #fff;
}
.entry.value > .value-container.function, .value-container.function {
  border-color: #88f;
  background-color: #ddf;
}
.entry.value > .value-container.keyword {
  border-color: #eeee33;
  background-color: #faf8dd;
}

.symbol.literal {
  color: #3a3;
  font-weight: bold;
  padding: 0 10px 0;
}
.value circle.attached {
  fill: #99c;
}
.symbol circle.attached {
  fill: #ccffcc;
  stroke-width: 2px;
  stroke: #5a5;
}
path.ellipsis {
  fill: #f3f3f3;
  stroke-width: 2px;
  stroke: #aaa;
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
  padding-left: 4px;
}
.placeholder {
  color: #999;
  font-style: italic;
  padding: 0 10px 0;
}
</style>
