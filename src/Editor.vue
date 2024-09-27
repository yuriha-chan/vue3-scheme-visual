<script setup>
import Palette from './Palette.vue'
import SlotList from './SlotList.vue'
</script>

<template>
  <div class="editor">
    <Palette @select-palette="selectPalette" :selected="editorState.selectedItem"/>
    <SlotList :values="[
     { type: 'value', assignment: null, template: { type: 'value', placeholder: 'body ...' } },
     { type: 'ellipsis', template: { type: 'value', placeholder: 'body ...' } }]"
     :editorState="editorState" key="root"/>
  </div>
</template>

<script>
// let editorState = { selectedItem: null }
export default {
  components: {
    Palette
  },
  data() {
    return {
      editorState: { selectedItem: null },
    }
  },
  methods: {
    selectPalette(item) {
      this.editorState.selectedItem = item;
    }
  }
}
</script>
<style>
.editor {
  display: flex;
}
</style>
