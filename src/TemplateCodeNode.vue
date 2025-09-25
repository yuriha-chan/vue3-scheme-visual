<script setup>
import ts from './translate.js'
import TemplateSlotList from './TemplateSlotList.vue'
</script>
<template>
  <div class="code-node" :class="['type-' + node.type, 'nest-' + (nestLevel % 5)]">
    <div>{{ t("description." + node.label) }}
    </div>
    <div class="horizontal">
      <div v-if="node.label !== undefined" :class="['node-head', node.type]" @click="rotateLists">{{ node.label }}</div>
      <TemplateSlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="true" :startIndex="0" :endIndex="node.rotate" :add="onAdd" :nestLevel="nestLevel + 1" :nestType="node.type"/>
    </div>
    <TemplateSlotList v-if="node.slots" :values="node.slots" :editorState="editorState" :horizontal="false" :startIndex="node.rotate" :endIndex="node.slots.length" :add="onAdd" :nestLevel="nestLevel + 1" :nestType="node.type"/>
  </div>
</template>
<script>
export default {
  props: {
    node: Object,
    editorState: Object,
    nestLevel: Number,
    nestType: String,
  },
  methods: {
    t(k) { return ts[this.editorState.language][k]; },
  }
}
</script>
