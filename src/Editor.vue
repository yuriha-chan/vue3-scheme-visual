<script setup>
import Palette from './Palette.vue'
import SlotList from './SlotList.vue'
import ts from './translate.js'
import Toggle from '@vueform/toggle'
import evalExpression from './eval.ts'
</script>

<template>
  <div class="screen">
  <div class="header">
  <div><Toggle v-model="editorState.showPalette"/>{{t("showPalette")}}</div>
  <div><Toggle v-model="editorState.showClipboard"/>{{t("showClipboard")}}</div>
  <div><Toggle v-model="editorState.showEllipses"/>{{t("showEllipses")}}</div>
  <div><Toggle v-model="editorState.showDescription"/>{{t("showDescription")}}</div>
  <button @click="evaluate">Eval</button>
  </div>
  <div class="editor">
    <div class="palette" v-if="editorState.showPalette">
    <Palette @select-palette="selectPalette" :selected="editorState.selectedItem"/>
    </div>
    <div class="main">
    <div class="canvas">
    <SlotList :values="editorState.root"
     :editorState="editorState" :startIndex="0" :endIndex="undefined" :horizontal="false" key="root"/>
    </div>
    </div>
    <div class="clipboard" v-show="editorState.showClipboard">
    Clipboard
    <SlotList :values="editorState.clipboard"
     :editorState="editorState" :startIndex="0" :endIndex="undefined" :horizontal="false" key="clipboard"/>
    </div>
  </div>
  <div class="log">
    <table>
    <tr v-for="item in editorState.logs"><td>[{{ item.type }}]</td><td>{{ item.timestamp.toLocaleTimeString() }}</td><th>{{ item.log }}</th></tr>
    </table>
    <div id="sentinel" :ref="(self) => { logsSentinel = self }"/>
  </div>
  </div>
</template>

<script>

function create() {
  return [ { type: 'value', index: "start", assignment: null, template: { type: 'value', placeholder: 'body ...' } },
           { type: 'ellipsis', index: "start-ellipsis", template: { type: 'value', placeholder: 'body ...' } } ]
}
export default {
  components: {
    Palette,
    Toggle,
  },
  data() {
    return {
      logsSentinel: null,
      editorState: { root: create(), language: "ja", draggingFromPalette: false, clipboard: [], dragTarget: null, showClipboard: true, showPalette: true, showEllipses: true, showDescription: false, logs: []},
    }
  },
  methods: {
    t(k) { return ts[this.editorState.language][k]; },
    selectPalette(item) {
      this.editorState.dragTarget = item;
      this.editorState.draggingFromPalette = true;
    },
    async appendLog(type, x) {
      this.editorState.logs.push({ type, timestamp: new Date(), log: x }); await this.$nextTick(); this.logsSentinel.scrollIntoView()
    },
    evaluate() {
      evalExpression(this.editorState.root, { log: (x) => this.appendLog("log", x) }, (v) => this.appendLog("eval", v) );
    }
  }
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style>
.editor {
  display: flex;
}
.main {
  flex-grow: 1;
  overflow: scroll;
}
.clipboard {
  max-width: 300px;
  min-width: 200px;
  overflow: scroll;
}
.palette {
  overflow: scroll;
}
.header {
  display: flex;
  padding: 0 0 8px;
}
.header > div {
  padding: 0 10px 0;
  margin: 0 10px 0;
  background-color: #eee;
}
.canvas {
  width: max-content;
}
.log {
  color: #eee;
  background-color: #222;
  font-family: monospace, monospace;
  padding: 5px;
  max-height: 10svh;
  overflow: scroll;
}
.log table {
  border-spacing: 5px 8px;
}
.log th {
  padding-left: 1rem;
}
.screen {
  height: 100svh;
  display: flex;
  flex-direction: column;
}
.editor {
  height: 50svh;
  flex-grow: 1;
}
</style>
