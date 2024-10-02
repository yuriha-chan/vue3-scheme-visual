<script setup>
import builtins from './Builtin.ts'
</script>
<template>
  <div class="palette">
    <ul>
      <li v-for="item in items" :class="[item.type, item == selected ? 'selected' : 'inactive']" draggable="true" @dragstart="onClick(item, $event)">
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    console.log(builtins);
    return {
      items: Object.values(builtins),
    };
  },
  props: ["selected"],
  methods: {
    onClick(item, e) {
      e.stopPropagation();
      this.$emit("selectPalette", item)
    },
  },
};
</script>

<style>
.palette {
  padding-right: 0.5em;
  min-width: 7em;
  background-color: #eee;
}
ul {
  padding: 0;
  margin: 0;
}
li {
  display: block;
  padding: 0.5em;
  margin: 3px;
  border: 1px solid #fff;
  border-radius: 0.4em;
  font-family: monospace, monospace;
  }
li.keyword {
  background-color: #970;
  color: #fff;
}
li.constant{
  border-color: #888;
}
li.function {
  background-color: #23a;
  color: #fff;
}
li.selected {
  outline: 3px solid #f80;
}
</style>
