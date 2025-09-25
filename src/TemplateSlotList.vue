<script setup>
import TemplateCodeNode from './TemplateCodeNode.vue'
import Syntax from './Syntax.ts'
import builtins from './Builtin.ts'
import parse from './Parser.js'
import ts from './translate.js'
</script>

<template>
  <div class="slotlists" :class="horizontal ? 'rotate' : 'vertical'">
    <div v-for="(item, i) in values.slice(startIndex, endIndex)" class="entry" :class="[item.type, 'nest-' + ((item.type === nestType) ? nestLevel : 0), item.clauseClass ? item.clauseClass : '']" key="item.index" v-show="editorState.showEllipses || item.type !== 'ellipsis'">
      <div class="description" v-if="item.type !== 'ellipsis' && item.description">{{ t(item.description) }}</div>
      <div class="entry-content">
       <div class="slot-container">
        <svg viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path v-if="item.type === 'clause'" d='M -6 -5 L 6 -5 M -6 0 L 6 0 M -6 5 L 6 5'/>
          <path v-else-if="item.type === 'ellipsis'" class="ellipsis" d="M 0 -8 L 8 0 L 0 8 L -8 0 Z"/>
          <circle v-else cx="0" cy="0" r="7" :class="[item.value ? 'attached' : 'empty']"/>
        </svg>
      </div>
      <div v-if="item.type == 'ellipsis'" class="value-container ellipsis-label"/>
      <div v-else-if="item.value" class="value-container">
        <TemplateCodeNode :editorState="editorState" :node="item.value" :nestLevel="(item.type === nestType) ? nestLevel : 0" :nestType="nestType"/>
      </div>
      <div v-else class="value-container placeholder">
        {{ item.placeholder ?? "add node ..."}}
      </div>
     </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["values", "horizontal", "startIndex", "endIndex", "editorState", "nestLevel", "nestType"],
  methods: {
    j(i) {
      return this.startIndex + i;
    },
    t(k) { return ts[this.editorState.language][k]; },
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
.placeholder {
  color: var(--placeholder);
  font-style: italic;
  padding: 0 10px 0;
}
</style>
