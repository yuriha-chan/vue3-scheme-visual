<template>
  <div class="modal-screen">
    <div class="modal">
      <div class="title">{{ title }}</div>
      <div class="choices">
        <div class="choice" v-for="slotName in slotNames" @click="onSelect(slotName)">
           <slot :name="slotName"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["title", "onSelect"],
  computed: {
    slotNames() {
      console.log(this.$slots);
      return Object.keys(this.$slots); // Get the names of all slots passed
    }
  }
}
</script>
<style scoped>
.modal-screen {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--modal-screen);
}
.title {
  padding: 2px 6px 2px;
}
.modal {
  background: var(--bg);
  min-width: 40%;
  max-width: 80%;
}
.choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px 14px;
}
.choice {
  border-radius: 10px;
  border: 4px solid var(--bg-alternate);
  padding: 12px;
  background-color: color-mix(in hsl, var(--bg-alternate), var(--bg));
}
.choice:nth-child(2n) {
  border-color: var(--bg-alternate-2);
  background-color: color-mix(in hsl, var(--bg-alternate-2), var(--bg));
}
.choice:hover {
  border-color: var(--highlight);
}
</style>
