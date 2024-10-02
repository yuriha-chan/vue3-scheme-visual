<script setup>
import CodeNode from './CodeNode.vue'
import Syntax from './Syntax.ts'
import builtins from './Builtin.ts'
import parse from './Parser.js'
import ts from './translate.js'
</script>

<template>
  <div class="slotlists" :class="horizontal ? 'rotate' : 'vertical'">
    <div v-for="(item, i) in items.slice(startIndex, endIndex)" class="entry" :class="item.type + ' ' + item.template.clauseClass" :key="item.index" draggable="true" @dragstart="d(j(i), $event)" v-show="editorState.showEllipses || item.type !== 'ellipsis'">
      <div class="description" v-show="editorState.showDescription">{{ (item.type !== "ellipsis" && item.template.description) ? t(item.template.description) : ""}}</div>
      <div class="entry-content">
       <div class="slot-container">
        <svg viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"  @click.right.prevent="onRClick(j(i))" @dragover="dropcheck(j(i), $event)" @drop="dd(j(i), $event)">
          <path v-if="!horizontal && item.type === 'clause'" d='M 0 -8 L 0 8 M 0 0 L 10 0'/>
          <path v-else-if="item.type === 'ellipsis'" class="ellipsis" d="M 0 -8 L 8 0 L 0 8 L -8 0 Z" @click="onClick(j(i))"/>
          <circle v-else cx="0" cy="0" r="7"
            :class="[item.assignment ? 'attached' : 'empty']"
            @click="onClick(j(i))"/>
        </svg>
        <div v-if="!horizontal && j(i) !== items.length - 1" class="slot-filler"/>
      </div>
      <div v-if="item.type == 'ellipsis'" class="value-container ellipsis-label" @click="onClick(j(i))"/>
      <div v-else-if="item.editing" class="value-container">
        <input v-model="inputs[j(i)]" :placeholder="item.template.placeholder" @keydown.enter="onClick(j(i))" @keydown.esc="abort(j(i))" :ref="(r) => {inputRefs[j(i)] = r;}" />
      </div>
      <div v-else-if="item.assignment" :class="['value-container', item.assignment.type]">
        <CodeNode :editorState="editorState" :node="item.assignment"/>
      </div>
      <div v-else class="value-container placeholder" @click="onClick(j(i))">
        {{ item.template.placeholder ?? "add node ..."}}
      </div>
     </div>
    </div>
  </div>
</template>

<script>

const valuesToAssignment = (values, slotType) =>
  { let selected = values[0] && values[0].type === 'symbol' && builtins[values[0].value];
    let args;
    if (selected) {
      args = values.slice(1);
    } else if (slotType === 'quote') {
      selected = builtins["empty list quote"];
      args = values;
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
          instance.assignment = valueToAssignment(v, slotType);
          slots.splice(i, 0, instance);
        } else {
          slots[i].assignment = valueToAssignment(v, slotType);
          // TODO: or assigned
        }
      });
    const ret = { type: selected.type, label: selected.label, value: selected.value, rotate: selected.rotate, slots: slots };
    return ret;
  };

const valueToAssignment = (s, slotType) =>
  (s.type === "number") ?
    { ...s, label: "" + s.value } :
  (s.type === "symbol") ?
    { ...s, label: "" + s.value } :
  (s.type === "string") ?
    { ...s, label: s.value } :
  (s.type === "list") ?
    valuesToAssignment(s.value, slotType) :
  null;

export default {
  data() {
    return {
      items: this.values,
      inputs: this.values.map(() => ""),
      inputRefs: [],
      addItem: this.add ? this.add : () => true,
    };
  },
  props: ["values", "horizontal", "startIndex", "endIndex", "editorState", "add"],
  methods: {
    j(i) {
      return this.startIndex + i;
    },
    t(k) { return ts[this.editorState.language][k]; },
    abort(i) {
      this.items[i].editing = false;
    },
    d(i, e) {
      e.stopPropagation();
      this.editorState.dragTarget = this.items[i];
      this.editorState.draggingFromPalette = false;
      this.editorState.dropComplete = () => {
        const item = Syntax.generate(this.items[i].template);
        item.expanded = this.items[i].expanded;
        this.items.splice(i, 1, item)
      }
    },
    dropcheck(i, e) {
      if (this.items[i].index !== this.editorState.dragTarget.index) {
        e.preventDefault();
      }
    },
    dd(i, e) {
      e.preventDefault();
      const target = this.editorState.dragTarget;
      if (this.items[i].type === "ellipsis") {
        this.onClick(i);
        i = i + 1
      }
      if (this.editorState.draggingFromPalette) {
        let slots = Syntax.generateAll(target);
        this.items[i].assignment = { type: target.type, label: target.label, value: target.value, rotate: target.rotate, slots: slots };
      } else {
        this.items[i].assignment = target.assignment;
        this.editorState.dropComplete();
      }
      e.stopPropagation();
      this.editorState.dragTarget = null;
    },

    async onClick(i) {
      let item = this.items[i];
      if (item.type == "ellipsis") {
        let instance = Syntax.generate(item.template);
        instance.expanded = true;
        this.items.splice(i, 0, item, instance);
        this.addItem(i);
        this.addItem(i);
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
          item.assignment = { type: selected.type, label: selected.label, value: selected.value, rotate: selected.rotate, slots: slots };
          this.editorState.selectedItem = null;
        } else {          
          await (item.editing = !item.editing);
          if (item.editing) {
            this.inputRefs[i].focus();
          } else {
            let s = parse("" + this.inputs[i]);
            console.log("item type:", item.type)
            item.assignment = valueToAssignment(s, item.type);
          }
        }
      }
      console.log(this.items)
    },
    onRClick(i) {
      let item = this.items[i];
      if (item.type === "ellipsis") {
        return;
      }
      if (item.expanded) {
        if (item.assignment) { this.editorState.clipboard.push(item) };
        this.items.splice(i, 1);
        if (this.items[i-1].type === "ellipsis") {
          this.items.splice(i - 1, 1);
        }
      } else {
        if (item.assignment) { this.editorState.clipboard.push(item) };
        this.items.splice(i, 1, Syntax.generate(item.template))
      }
    }
  }
}
</script>
<style>
.slotlists {
  padding: 1px;
  display: flex;
  flex-direction: column;
  gap: 5px;
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
.symbol > .slot-container circle.empty {
  fill: #e8ffe8;
  stroke: #5a5;
}

.quote > .slot-container circle.empty {
  fill: #aaa;
  stroke: #666;
}

.literal, input {
  font-family: "DejaVu Sans Mono", monospace, monospace;
}
.value-container {
  border-radius: 5px;
  border: 2px solid transparent;
  margin: 0;
}
.slotlists.rotate > .entry > .entry-content {
  align-items: center;
}
.entry.value > .entry-content > .value-container {
  background-color: #fff;
}
.entry.value > .entry-content > .value-container.function, .value-container.function {
  border-color: #88f;
  background-color: #ddf;
}
.entry.value > .entry-content > .value-container.keyword {
  border-color: #eeee33;
  background-color: #faf8dd;
}

.entry.quote > .entry-content > .entry.value {
  background-color: #ffffff;
}

.entry > .description {
  background-color: #ffffff;
  color: #994400;
}

.clause.assoc {
  background-color: #e3ffdd;
  border: 2px dashed #c3eebb;
}

.symbol.literal {
  color: #3a3;
  font-weight: bold;
  padding: 0 10px 0;
}

.value > .entry-content > .slot-container > svg > circle.attached {
  fill: #99c;
  stroke: #55f;
  stroke-width: 2px;
}

.symbol > .entry-content > .slot-container > svg > circle.attached {
  fill: #ccffcc;
  stroke-width: 2px;
  stroke: #5a5;
}

.quote > .entry-content > .slot-container > svg > circle.attached {
  fill: #444444;
  stroke-width: 2px;
  stroke: #222222;
}

.quote {
  background-color: #dddddd;
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
.entry-content {
  display: flex;
}
.slot-container{
  /* display: flex;
  flex-direction: column; */
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
