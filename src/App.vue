<template>
  <div id="app" class="container">
    <TheLogin/>
    <SelectUser/>
    <DailyFood/>
  </div>
</template>

<script>
import TheLogin from './components/TheLogin.vue'
import SelectUser from './components/SelectUser.vue'
import DailyFood from './components/DailyFood.vue'

export default {
  name: 'App',
  components: {
    TheLogin,
    SelectUser,
    DailyFood
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
