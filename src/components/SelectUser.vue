<template>
  <div v-if="authenticated" class="row justify-content-center p-3">
    <div v-if="newUserFormVisible" class="col-md-6">
      <form @submit="addUser" v-if="authenticated" method="post">
        <h3>Add new user</h3>
        <p v-if="errors.length" class="alert alert-danger row">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </p>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Name</label>
          <input type="text" class="form-control col-sm-8" name="username" placeholder="Matti" v-model="username"/>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Age</label>
          <input type="number" min="0" class="form-control col-sm-8" name="age" placeholder="22" v-model="age"/>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Height</label>
          <input type="number" class="form-control col-sm-8" name="height" placeholder="170" v-model="height"/>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Weight</label>
          <input type="number" class="form-control col-sm-8" name="weight" placeholder="70" v-model="weight"/>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Exercise level</label>
          <select v-model="exerciseLevel" class="form-control col-sm-8">
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>  
        </div>
        <button type="submit" class="btn btn-dark mr-3">Add user</button>
        <button type="button" class="btn btn-secondary" @click="hideNewUserForm">Cancel</button>
      </form>
    </div>
    <div v-else>
      <button @click="showNewUserForm" class="btn btn-dark btn-block p-6">Add new user</button>
      <p class="mt-2 mb-0">OR</p>
      <p class="mb-1">Select user</p>
      <div class="row justify-content-center">
        <select v-model="selectedUserRecId" class="col-sm-8">
          <option disabled value="">Select user</option>
          <option v-for="user in filteredUsers" :key="user.recordId" :value="user.recordId">
              {{ user.fieldData.name }}
          </option>
        </select>
      </div>
      <h4 v-if="userData != null" class="pt-3">Selected user {{ userData.fieldData.name }}</h4>
      <h4 v-else class="pt-3">No user selected</h4>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SelectUser',
  data() {
    return {
      errors: [],
      username: null,
      age: null,
      height: null,
      weight: null,
      exerciseLevel: 'Normal',
      selectedUserRecId: null,
      fetchingUsers: false,
      allUsers: null
    }
  },
  methods: {
    showNewUserForm() {
      this.$store.dispatch('changeNewUserFormVisibility', true);
    },
    
    hideNewUserForm() {
      this.$store.dispatch('changeNewUserFormVisibility', false);
    },

    addUser(e) {
      this.errors = [];

      if (!this.username) {
        this.errors.push("Username required.");
      }

      if (!this.age) {
        this.errors.push("Age required.");
      }
      
      if (!this.height) {
        this.errors.push("Height required.");
      }
      
      if (!this.weight) {
        this.errors.push("Weight required.");
      }
      
      if (!this.exerciseLevel) {
        this.errors.push("Exercise level required.");
      }

      //if no errors
      if (!this.errors.length) {
        fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/layouts/User/records', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.token,
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            "fieldData":
            { 
              "age": this.age, 
              "Height": this.height,
              "Weight": this.weight,
              "Exercise_level" : this.exerciseLevel,
              "name": this.username 
            } 
          })
        })
        .then(response => {
          if(response.ok){
            return response.json();
          }
          else if(response.status == 401){
            this.$store.dispatch('refreshToken');
          }
        })
        .then(response => {
          this.fetchAllUsers();
          this.selectedUserRecId = response.response.recordId;
          this.hideNewUserForm();
        })
        .catch(err => {
          console.log(err);
        })
      }

      e.preventDefault();
    },

    fetchAllUsers() {
      this.fetchingUsers = true;
      fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/layouts/User/records', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + this.token
        }
      })
      .then(response => {
        if(response.ok){
          return response.json();
        }
        else if(response.status == 401){
          this.$store.dispatch('refreshToken');
        }
      })
      .then(response => {
        this.allUsers = response.response.data;
        this.fetchingUsers = false;
      })
      .catch(err => {
        console.log(err);
      })
    },

    handleUserSelection() {
      for(var i = 0; i < this.allUsers.length; i++){
        if(this.allUsers[i].recordId == this.selectedUserRecId){
          this.selectedUserName = this.allUsers[i].fieldData.name;
          this.$store.dispatch('userSelected', this.allUsers[i]);
          break;
        }
      }
    }
  },
  computed: {
    ...mapState(['token', 'authenticated', 'newUserFormVisible', 'userData']),

    filteredUsers() {
      if(this.allUsers != null)
        return this.allUsers.filter(x => x.fieldData.name != "" );
      return [];
    }
  },
  created(){
    if(this.authenticated && !this.fetchingUsers && this.allUsers == null)
      this.fetchAllUsers();
  },
  watch: {
    authenticated(newValue){
      if(newValue) {
        this.fetchAllUsers();
      }
    },
    selectedUserRecId(newValue){
      if(newValue != null)
        this.handleUserSelection();
    },
    allUsers(newValue) {
      if(newValue){
        this.handleUserSelection();
      }
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
