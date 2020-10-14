<template>
  <div class="row justify-content-center">
    <div class="col-12">
        <h1>Calorie counter</h1>
    </div>
    <div class="row">
      <form @submit="logIn" v-if="!authenticated" method="post">
        <h3>Log in</h3>
        <p v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </p>
        <p v-if="loginErrors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in loginErrors" :key="error">{{ error }}</li>
          </ul>
        </p>
        <div class="form-group">
          <input type="text" class="form-control" name="username" placeholder="Username" v-model="usernameInput"/>
        </div>
        <div class="form-group">
            <input type="password" class="form-control" name="password" placeholder="Password" v-model="password"/>
        </div>
        <button type="submit" class="btn btn-dark btn-block">Log in</button>
      </form>
      <h4 v-else class="border-top border-bottom p-1">Logged in as {{ apiUsername }}</h4>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TheLogin',
  data() {
    return {
      errors: [],
      usernameInput: null,
      password: null
    }
  },
  methods: {
    logIn(e) {
      this.errors = [];

      if (!this.usernameInput) {
        this.errors.push("Username required.");
      }
      if (!this.password) {
        this.errors.push('Password required.');
      } 

      //if no errors then try getting the token
      if (this.errors.length == 0) {
        this.$store.dispatch('onLoginStarted', { 'apiUsername':this.usernameInput, 'apiAuthString':btoa(this.usernameInput + ':' + this.password) });
        this.$store.dispatch('refreshToken');
      }

      e.preventDefault();
    },
  },
  computed: {
    ...mapState(['token', 'authenticated', 'apiUsername', 'apiAuthString', 'loginErrors']),
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
