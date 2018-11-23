<template>
  <button @click="click()">
    clicked: {{ clicked }}
  </button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Test extends Vue {
  private clicked = 0;

  private click() {
    this.clicked += 1;
  }
}
</script>
