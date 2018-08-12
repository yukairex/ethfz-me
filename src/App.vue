<template>
  <div id="app">
    <div id="mask">
    <div class="main-container">
      <router-view :key="key"></router-view>
    </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
  },
  computed: {
    key() {
      return this.$route.name !== undefined
        ? this.$route.name + +new Date()
        : this.$route + +new Date();
    },
  },
};
</script>

<style>
#app {
  background-image: url("/static/assets/background.png");
  background-size: 100%;
}
#mask {
  background: rgba(0,0,0,0.5);
}
</style>
