import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState({
    storage: window.sessionStorage,
  })],
  state: {
    apiUsername: null,
    apiAuthString: null,
    token: null,
    authenticated: false,
    userData: null,
    newUserFormVisible: false,
    loginErrors: []
  },
  getters: {
    token: state => {
      return state.token;
    },
    authenticated: state => {
      return state.authenticated;
    },
    newUserFormVisible: state => {
      return state.newUserFormVisible;
    },
    userData: state => {
      return state.userData;
    },
    apiAuthString: state => {
      return state.apiAuthString;
    },
  },
  mutations: {
    setLoginData(state, {token}) {
      state.token = token;
      state.authenticated = true;
    },

    setApiAuthString(state, apiAuthString){
      state.apiAuthString = apiAuthString;
    },

    setApiUsername(state, apiUsername){
      state.apiUsername = apiUsername;
    },

    setToken(state, token){
      state.token = token;
    },

    resetLoginData(state) {
      state.token = null,
      state.authenticated = false,
      state.apiUsername = null,
      state.apiAuthString = null,
      state.userData = null
    },

    setUserData(state, userData){
      state.userData = userData;
    },

    setLoginErrors(state, errors){
      state.loginErrors = errors;
    },

    setNewUserFormVisible(state, newUserFormVisible) {
      state.newUserFormVisible = newUserFormVisible;
    },

    addFoodItems(state, foodItems) {
      state.foodItems = foodItems;
    }
  },
  actions: {
    onLoginSuccess({commit}, {token}) {
      commit('setLoginData', {token});
    },
    
    onLoginStarted({commit}, { apiUsername, apiAuthString }) {
      commit('setApiUsername', apiUsername);
      commit('setApiAuthString', apiAuthString);
    },

    refreshToken({commit, getters}){
      let errors = [];

      fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/sessions', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + getters.apiAuthString,
            'Content-type': 'application/json',
            'Content-Length': '0'
          }
        })
        .then(response => {
          if(response.ok){
            return response.json();
          }
          else{
            if(response.status == 401){
              errors.push("Username or password wrong.");
            }
            commit('resetLoginData');
            commit('setLoginErrors', errors);
          }
        })
        .then(response => {
          commit('setLoginData', { 'token':response.response.token });
        })
        .catch(err => {
          console.log(err);
        })
    },

    tokenRefreshed({commit}, token) {
      commit('setToken', token);
    },
    
    tokenRefreshFailed({commit}){
      commit('resetLoginData');
    },

    userSelected({commit}, userData) {
      commit('setUserData', userData);
    },

    changeNewUserFormVisibility({commit}, newUserFormVisible){
      commit('setNewUserFormVisible', newUserFormVisible);
    },
  }
})

export default store;