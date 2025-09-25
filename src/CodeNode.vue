<script setup>
import { defineAsyncComponent } from 'vue'
import ts from './translate.js'
</script>

<template>
  <div v-if="node.alignIndex" class="code-node" :class="['type-' + node.type, 'nest-' + (nestLevel % 5)]">
    <div class="horizontal">
      <div v-if="node.label !== undefined" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
      <div>
        <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="true" :startIndex="0" :endIndex="node.rotate" :nestLevel="nestLevel + 1" :nestType="node.type"/>
        <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="false" :startIndex="node.rotate" :endIndex="node.slots.length" :nestLevel="nestLevel + 1" :nestType="node.type"/>
      </div>
      </div>
  </div>
  <div v-else class="code-node" :class="['type-' + node.type, 'nest-' + (nestLevel % 5)]">
    <div v-show="editorState.showDescription" @click="toggleTooltip">{{ t("description." + node.label) }}
    <div class="tooltip" v-show="tooltip">{{ t("tooltip." + node.label) }}</div>
    </div>
    <div class="horizontal">
      <div v-if="node.label !== undefined" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
      <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="true" :startIndex="0" :endIndex="node.rotate" :add="onAdd" :nestLevel="nestLevel + 1" :nestType="node.type"/>
    </div>
    <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="false" :startIndex="node.rotate" :endIndex="node.slots.length" :add="onAdd" :nestLevel="nestLevel + 1" :nestType="node.type"/>
    <div v-show="editorState.showDescription">{{ t("end." + node.label) }}</div>
  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    editorState: Object,
    index: String,
    nestLevel: Number,
    nestType: String,
  },
  data() {
    return { tooltip: false }
  },
  components:  {
    "SlotList": defineAsyncComponent(() => import('./SlotList.vue'))
  },
  methods: {
    rotateLists() {
      this.node.rotate = isNaN(Number(this.node.rotate)) ? 0 : this.node.rotate;
      this.node.rotate = (this.node.rotate + 1) % (this.node.slots ? (this.node.slots.length + 1): 2)
    },
    t(k) { return ts[this.editorState.language][k]; },
    onAdd(index) {
      console.log("onAdd", index, this.node.rotate)
      if (index < this.node.rotate) {
        this.node.rotate = isNaN(Number(this.node.rotate)) ? 0 : this.node.rotate;
        this.node.rotate += 1;
      }
    },
    toggleTooltip() {
      this.tooltip = !this.tooltip;
    }
  },
};
</script>

<style>
.code-node {
  display: flex;
  flex-direction: column;
  padding: 0 2px 0;
  border-radius: 5px;
  border: 1px solid transparent;
  margin: 0;
}

.code-node.type-keyword.nest-0 {
  border-color: var(--keyword-border);
  background-color: color-mix(in hsl, var(--keyword-bg-start), var(--keyword-bg-end)  0%);
}                                                                               
.code-node.type-keyword.nest-1 {                                                
  border-color: var(--keyword-border);                                          
  background-color: color-mix(in hsl, var(--keyword-bg-start), var(--keyword-bg-end) 25%);
}                                                                               
.code-node.type-keyword.nest-2 {                                                
  border-color: var(--keyword-border);                                          
  background-color: color-mix(in hsl, var(--keyword-bg-start), var(--keyword-bg-end) 50%);
}                                                                               
.code-node.type-keyword.nest-3 {                                                
  border-color: var(--keyword-border);                                          
  background-color: color-mix(in hsl, var(--keyword-bg-start), var(--keyword-bg-end) 75%);
}                                                                               
.code-node.type-keyword.nest-4 {                                                
  border-color: var(--keyword-border);                                          
  background-color: color-mix(in hsl, var(--keyword-bg-start), var(--keyword-bg-end) 100%);
}

.code-node.type-function.nest-0 {
  border-color: var(--function-border);
  background-color: color-mix(in hsl, var(--function-bg-start), var(--function-bg-end)  0%);
}                                                                               
.code-node.type-function.nest-1 {                                                
  border-color: var(--function-border);                                          
  background-color: color-mix(in hsl, var(--function-bg-start), var(--function-bg-end) 25%);
}                                                                               
.code-node.type-function.nest-2 {                                                
  border-color: var(--function-border);                                          
  background-color: color-mix(in hsl, var(--function-bg-start), var(--function-bg-end) 50%);
}                                                                               
.code-node.type-function.nest-3 {                                                
  border-color: var(--function-border);                                          
  background-color: color-mix(in hsl, var(--function-bg-start), var(--function-bg-end) 75%);
}                                                                               
.code-node.type-function.nest-4 {                                                
  border-color: var(--function-border);                                          
  background-color: color-mix(in hsl, var(--function-bg-start), var(--function-bg-end) 100%);
}
.code-node.type-quote.nest-0 {
  border-color: var(--quote-border);
  background-color: color-mix(in hsl, var(--quote-bg-start), var(--quote-bg-end)  0%);
}                                                                               
.code-node.type-quote.nest-1 {                                                
  border-color: var(--quote-border);                                          
  background-color: color-mix(in hsl, var(--quote-bg-start), var(--quote-bg-end) 25%);
}                                                                               
.code-node.type-quote.nest-2 {                                                
  border-color: var(--quote-border);                                          
  background-color: color-mix(in hsl, var(--quote-bg-start), var(--quote-bg-end) 50%);
}                                                                               
.code-node.type-quote.nest-3 {                                                
  border-color: var(--quote-border);                                          
  background-color: color-mix(in hsl, var(--quote-bg-start), var(--quote-bg-end) 75%);
}                                                                               
.code-node.type-quote.nest-4 {                                                
  border-color: var(--quote-border);                                          
  background-color: color-mix(in hsl, var(--quote-bg-start), var(--quote-bg-end) 100%);
}
.code-node.type-symbol {
  border-color: var(--symbol);
  background-color: var(--bg);
  padding: 1px 3px 1px;
}
.code-node.type-number {
  border-color: var(--constant);
  background-color: var(--bg);
  padding: 1px 3px 1px;
}
.code-node.type-string {
  border-color: var(--string);
  background-color: var(--bg);
  padding: 1px 3px 1px;
}

.horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.node-head {
  display: block;
  font-family: "Droid Sans Mono", monospace, monospace;
  font-weight: bold;
  padding: 2px 0 2px;
  min-width: 60px;
}
.node-head.string::before{
  content: "❝";
  color: color-mix(in hsv, var(--string), var(--fg) 20%);
  margin-right: 3px;
}
.node-head.string::after{
  content: "❞";  
  color: color-mix(in hsv, var(--string), var(--fg) 20%);
  margin-left: 3px;
}
.node-head.string {
  color: var(--string);
}
.node-head.symbol {
  color: var(--symbol);
  font-weight: bold;
}
.node-head.number {
  color: var(--constant);  
  font-weight: bold;
}

.highlight {
  background-color: yellow;
}
.tooltip {
  position: relative;
  border: 3px solid #ccc;
  background-color: #eee;
  padding: 5px;
}
</style>
