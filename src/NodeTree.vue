<script setup>
import { defineAsyncComponent } from 'vue'
</script>

<template>
  <div class="tree-node">
    <div v-if="node.type" :class="['node-head', node.type]">{{ node.label }}</div>
    <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState"/>
  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    editorState: Object,
    index: String,
  },
  components:  {
    "SlotList": defineAsyncComponent(() => import('./SlotList.vue'))
  },
  methods: {
  },
};
</script>

<style>
.tree-node {
  display: flex;
  flex-direction: column;
}
.node-head {
  display: block;
  border-radius: 0.5em;
  font-family: monospace, monospace;
  padding: 0.3em;
}
.node-head.function {
  background-color: #23c;
  color: #fff;
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
</style>
