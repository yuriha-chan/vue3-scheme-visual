<script setup>
import CodeNode from './CodeNode.vue'
import TemplateSlotList from './TemplateSlotList.vue'
import Syntax from './Syntax.ts'
import builtins from './Builtin.ts'
import parse from './Parser.js'
import ts from './translate.js'
import ModalSelector from './ModalSelector.vue'
</script>

<template>
  <div class="slotlists" :class="horizontal ? 'rotate' : 'vertical'" v-if="startIndex < items.length">
    <div v-for="(item, i) in items.slice(startIndex, endIndex)" class="entry" :class="[item.type, 'nest-' + ((item.type === nestType) ? nestLevel : 0), item.template.clauseClass ? item.template.clauseClass : '']" key="item.index" draggable="true" @dragstart="d(j(i), $event)" v-show="editorState.showEllipses || item.type !== 'ellipsis'">
      <div class="description" v-if="editorState.showDescription && item.type !== 'ellipsis' && item.template.description">{{ t(item.template.description) }}</div>
      <div class="entry-content">
       <div class="slot-container">
        <svg viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"  @click.right.prevent="onRClick(j(i))" @dragover="dropcheck(j(i), $event)" @drop="dd(j(i), $event)">
          <path v-if="item.type === 'clause'" d='M -6 -5 L 6 -5 M -6 0 L 6 0 M -6 5 L 6 5'/>
          <path v-else-if="item.type === 'ellipsis'" class="ellipsis" d="M 0 -8 L 8 0 L 0 8 L -8 0 Z" @click="onClick(j(i))"/>
          <circle v-else cx="0" cy="0" r="7"
            :class="[item.assignment ? 'attached' : 'empty']"
            @click="onClick(j(i))"/>
        </svg>
      </div>
      <div v-if="item.type == 'ellipsis'" class="value-container ellipsis-label" @click="onClick(j(i))"/>
      <div v-else-if="item.editing && !item.template.syntaxChoices" class="value-container">
        <input v-model="inputs[j(i)]" :placeholder="item.template.placeholder" @keydown.enter="onClick(j(i))" @keydown.esc="abort(j(i))" :ref="(r) => {inputRefs[j(i)] = r;}" />
      </div>
      <div v-else-if="item.assignment" class="value-container">
        <CodeNode :editorState="editorState" :node="item.assignment" :nestLevel="(item.assignment.type === nestType) ? nestLevel : 0" :nestType="nestType"/>
      </div>
      <div v-else class="value-container placeholder" @click="onClick(j(i))">
        {{ item.template.placeholder ?? "add node ..."}}
      </div>
      <ModalSelector v-if="item.editing && item.template.syntaxChoices" :title="t('select-syntax')"
        @select='(k) => { console.log(item.template.syntaxChoices[k].map((x) => Syntax.generate(x, editorState.counter))); items.splice(j(i), 1, ...item.template.syntaxChoices[k].map((x) => Syntax.generate(x, editorState.counter))); console.log(items[j(i)]); item.editing=false; }'>
        <template v-for="(choice, key) in item.template.syntaxChoices" v-slot:[key]>
          <TemplateSlotList :editorState="editorState" :values="choice" :nestLevel="0" nestType="" />
        </template>
      </ModalSelector>
     </div>
    </div>
  </div>
</template>

<script>

const valuesToAssignment = (values, slotType, counter) =>
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
    const slots = Syntax.generateAll(selected, counter);
    args.forEach((v, i) => {
        const item = slots[i];
        if (item.type == "ellipsis") {
          let instance = Syntax.generate(item.template, counter);
          instance.expanded = true;
          instance.assignment = valueToAssignment(v, slotType, counter);
          slots.splice(i, 0, instance);
        } else {
          slots[i].assignment = valueToAssignment(v, slotType, counter);
          // TODO: or assigned
        }
      });
    const ret = { type: selected.type, label: selected.label, value: selected.value, rotate: selected.rotate, slots: slots };
    return ret;
  };

const valueToAssignment = (s, slotType, counter) =>
  (s.type === "number") ?
    { ...s, label: "" + s.value } :
  (s.type === "symbol") ?
    { ...s, label: "" + s.value } :
  (s.type === "string") ?
    { ...s, label: s.value } :
  (s.type === "list") ?
    valuesToAssignment(s.value, slotType, counter) :
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
  props: ["values", "horizontal", "startIndex", "endIndex", "editorState", "add", "nestLevel", "nestType"],
  methods: {
    alert(t) {
      alert(t);
    },
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
        const item = Syntax.generate(this.items[i].template, this.editorState.counter);
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
        let slots = Syntax.generateAll(target, this.editorState.counter);
        console.log("on pallete drop", target.value);
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
        let instance = Syntax.generate(item.template, this.editorState.counter);
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
          let slots = Syntax.generateAll(selected, this.editorState.counter);
          item.assignment = { type: selected.type, label: selected.label, value: selected.value, rotate: selected.rotate, slots: slots };
          this.editorState.selectedItem = null;
        } else {
          await (item.editing = !item.editing);
          if (!item.template.syntaxChoices) {
            if (item.editing) {
              this.inputRefs[i].focus();
            } else {
              let s = parse("" + this.inputs[i]);
              console.log("item type:", item.type)
              item.assignment = valueToAssignment(s, item.type, this.editorState.counter);
            }
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
        if (item.assignment) { this.editorState.clipboard.unshift(item) };
        this.items.splice(i, 1);
        if (this.items[i-1].type === "ellipsis") {
          this.items.splice(i - 1, 1);
        }
      } else {
        if (item.assignment) { this.editorState.clipboard.unshift(item) };
        this.items.splice(i, 1, Syntax.generate(item.template, this.editorState.counter))
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
  gap: 3px;
}
.slotlists.rotate {
  flex-direction: row;
  align-items: center;
}
svg {
  display: block;
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
.entry-content {
  align-items: center;
  gap: 3px;
}
.entry.quote > .entry-content > .entry.value {
  background-color: var(--bg);
}
.entry > .description {
  background-color: var(--bg);
  color: #994400;
  padding: 0 3px 0;
}
.entry > .description::before {
  content: "■ "
}

.clause.list {
  background-color: #e3ffdd;
  border: 2px dashed #c3eebb;
}

.clause.pair {
  background-color: #8888ff;
  border: 2px dashed #c3eebb;
}

.symbol.literal {
  color: var(--symbol);
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
  display: flex;
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
.placeholder {
  color: var(--placeholder);
  font-style: italic;
  padding: 0 10px 0;
}
</style>
