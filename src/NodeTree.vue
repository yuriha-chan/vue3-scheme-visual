<script setup>
import { defineAsyncComponent } from 'vue'
</script>

<template>
  <div class="tree-node">
    <div class="rotate">
    <div v-if="node.type" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
    <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :rotate="true" :rotateIndex="rotate" :j="0"/>
    </div>
    <SlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :rotate="false" :rotateIndex="rotate" :j="rotate"/>
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
    return { rotate: 0 }
  },
  components:  {
    "SlotList": defineAsyncComponent(() => import('./SlotList.vue'))
  },
  methods: {
    rotateLists() {
      this.rotate = (this.rotate + 1) % (this.node.slots ? (this.node.slots.length + 1): 2) ;
    },
  },
};
</script>

<style>
.tree-node {
  display: flex;
  flex-direction: column;
}

.rotate {
  display: flex;
  flex-direction: row;
}

.node-head {
  display: block;
  font-family: "Droid Sans Mono", monospace, monospace;
  font-weight: bold;
  padding: 2px 0 2px;
  min-width: 60px;
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
</style>
