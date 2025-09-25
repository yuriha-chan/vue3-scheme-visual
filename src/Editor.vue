<script setup>
import Palette from './Palette.vue'
import SlotList from './SlotList.vue'
import ts from './translate.js'
import Toggle from '@vueform/toggle'
import evalExpression from './eval.ts'
import util from 'util'
import DiceBox from "@3d-dice/dice-box";

</script>

<template>
  <div id="dice-box" :class="diceBoxActive" @click="()=>{diceBoxActive = 'inactive'}"/>
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
  <div class="message" :ref="(self) => { console.log(self); message = self }"></div>
  <div class="log">
    <table>
    <tr v-for="item in editorState.logs"><td>[{{ item.type }}]</td><td>{{ item.timestamp.toLocaleTimeString() }}</td><th>{{ item.log }}</th></tr>
    </table>
    <div id="sentinel" :ref="(self) => { logsSentinel = self }"/>
  </div>
  </div>
</template>

<script>

const loadCode = () => {
  const v = localStorage.getItem("code");
  if (v) {
    const code = JSON.parse(v)
    if (code) return code;
  }
  return [ { type: 'value', index: "start", assignment: null, template: { type: 'value', placeholder: 'body ...' } },
           { type: 'ellipsis', index: "start-ellipsis", template: { type: 'value', placeholder: 'body ...' } } ]
}

const inspect = (x, depth = 4) =>
  (depth < 0) ? "..." :
  (typeof x === "symbol") ?
    x.toString() :
  (typeof x !== "object" && typeof x !== "function" || x === null || x === undefined) ?
    "" + x :
  (x instanceof Array) ?
   `[ ${x.map(x => inspect(x, depth - 1)).join(",\n")} ]` :
   `#${x.constructor.name} { ${Object.entries(x).map(x => inspect(x[0], depth - 1) + ": " + inspect(x[1], depth - 1)).join(",\n")} }`

let diceBox;
let rolled = false;

const makeCounter = (init) => {
  const ret = {
    value: init,
    next: () => `codeNode-${ret.value++}`,
  };
  return ret;
}

const loadCounter = () => {
  const v = localStorage.getItem("counter");
  if (v) {
    return makeCounter(v); 
  } else {
    return makeCounter(0);
  }
}

export default {
  components: {
    Palette,
    Toggle,
  },
  data() {
    return {
      logsSentinel: null,
      message: null,
      diceBoxActive : 'inactive',
      editorState: { root: loadCode(), counter: loadCounter(), language: "ja", draggingFromPalette: false, clipboard: [], dragTarget: null, showClipboard: true, showPalette: true, showEllipses: true, showDescription: false, logs: []},
    }
  },
  mounted() {
    diceBox = new DiceBox("#dice-box", {
      assetPath: "/assets/", // required
      scale: 8,
      throwForce: 5,
      spinForce: 5,
      startingHeight: 3,
      settleTimeout: 4000,
      angularDamping: .6,
      restitution: 0.4,
      delay: 50,
      frection: 0.9,
      })
  },
  methods: {
    t(k) { return ts[this.editorState.language][k]; },
    selectPalette(item) {
      this.editorState.dragTarget = item;
      this.editorState.draggingFromPalette = true;
    },
    async appendLog(type, ...x) {
      this.editorState.logs.push({ type, timestamp: new Date(), log: inspect(x) }); await this.$nextTick(); this.logsSentinel.scrollIntoView()
    },
    evaluate() {
      const io = {
        roll: (x) => {
          this.diceBoxActive = 'active';
          if (rolled) {
            diceBox.clear();
            return diceBox.roll(x);
          } else {
            const res = diceBox.init().then(() => diceBox.roll(x));
            rolled = true;
            return res
          }
        },
        log: (...x) => this.appendLog("log", ...x),
        message: () => this.message,
      };
      evalExpression(this.editorState.root, io, (v) => this.appendLog("eval", v),  (...v) => this.appendLog("error", ...v));
      localStorage.setItem("code", JSON.stringify(this.editorState.root));
      localStorage.setItem("counter", JSON.stringify(this.editorState.counter.value));
    }
  }
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style>
:root {
  --bg: white;
  --inverted-bg: black;
  --bg-alternate: #eef8ee;
  --bg-alternate-2: #eef0ff;
  --fg: black;
  --inverted-fg: white;
  --modal-screen: color-mix(in hsl, var(--inverted-bg), transparent 80%);
  --function: #437FF2;
  --function-alternate: #7733FF;
  --keyword: #FFEB00;
  --keyword-alternate: #FF8000;
  --symbol: #6EC207;
  --constant: #117554;
  --string: #EB8317;
  --quote: #666666;
  --function-bg-start: color-mix(in hsl, var(--function), var(--bg) 20%);
  --function-bg-end: color-mix(in hsl, var(--function-alternate), var(--bg) 20%);
  --keyword-bg-start: color-mix(in hsl, var(--keyword), var(--bg) 20%);
  --keyword-bg-end: color-mix(in hsl, var(--keyword-alternate), var(--bg) 20%);
  --quote-bg-start:  color-mix(in hsl, var(--quote), var(--bg) 60%);
  --quote-bg-end:  color-mix(in hsl, var(--quote), var(--bg) 20%);
  --symbol-bg:  color-mix(in hsl, var(--symbol), var(--bg) 30%);
  --string-bg:  color-mix(in hsl, var(--string), var(--bg) 30%);
  --placeholder: color-mix(in hsl, var(--fg) 30%, var(--bg));
  --highlight: #FFCC00;
}

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
  max-height: 30svh;
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
.message {
  height: 10svh;
  overflow: hidden;
  padding: 5px;
}
#dice-box {
  visibility: hidden;
  position: fixed;
  box-sizing: border-box;
  width: 50%;
  height: 50%;
  background: #caa;
  top: 25%;left: 25%;
}
#dice-box.active {
  visibility: visible;
}

#dice-box canvas {
  width: 100%;
  height: 100%;
}
</style>
