<script setup>
import { defineAsyncComponent } from 'vue'
import ts from './translate.js'
</script>

<template>
  <div v-if="node.alignIndex" class="code-node">
    <div class="horizontal">
      <div v-if="node.type" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
      <div>
        <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="true" :startIndex="0" :endIndex="node.rotate"/>
        <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="false" :startIndex="node.rotate" :endIndex="node.slots.length"/>
      </div>
      </div>
  </div>
  <div v-else class="code-node">
    <div v-show="editorState.showDescription" @click="toggleTooltip">{{ t("description." + node.label) }}
    <div class="tooltip" v-show="tooltip">{{ t("tooltip." + node.label) }}</div>
   </div>
    <div class="horizontal">
      <div v-if="node.type" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
      <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="true" :startIndex="0" :endIndex="node.rotate" :add="onAdd"/>
    </div>
    <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="false" :startIndex="node.rotate" :endIndex="node.slots.length" :add="onAdd"/>
  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    editorState: Object,
    index: String,
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
  padding: 2px;
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
.node-head.string {
  color: #d33;  
}
.node-head.string::before{
  content: "❝";
  color: #a55;
  margin-right: 3px;
}
.node-head.string::after{
  content: "❞";  
  color: #a55;
  margin-left: 3px;
}
.node-head.function {
  color: #00f;
}

.highlight {
  background-color: yellow;
}
.number {
  color: #f33;  
  font-weight: bold;
}
.symbol {
  color: #3a3;
  font-weight: bold;
}
.tooltip {
  position: relative;
  border: 3px solid #ccc;
  background-color: #eee;
  padding: 5px;
}
</style>
