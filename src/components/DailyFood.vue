<template>
  <div v-if="authenticated && !newUserFormVisible && userData != null" class="row justify-content-center border-top pt-2">
    <div class="col-md-6">
      <h4 class="col-12">Select food you have eaten</h4>
      <form @submit="addFoodForDate" method="post">
        <p v-if="errors.length" class="alert alert-danger row">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </p>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Date</label>
          <input type="date" class="form-control col-sm-8" name="selected-date" v-model="selectedDate">
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Food</label>
          <select v-model="selectedFoodRecId" class="form-control col-sm-8" name="selected-food">
            <option disabled value="">Select food</option>
            <option v-for="foodItem in foodItems" :key="foodItem.recordId" :value="foodItem.recordId">
                {{ foodItem.fieldData.Food }}
            </option>
          </select>  
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-4">Quantity (grams)</label>
          <input v-model="quantity" type="number" class="form-control col-sm-8" name="quantity" placeholder="125" min="1">
        </div>
        <div class="form-group row mb-1">
          <p class="col-form-label col-sm-4">Calories</p>
          <span class="col-sm-4 text-left">{{ calcCalories }}</span>
          <button type="submit" class="btn btn-dark col-sm-4">Submit</button>
        </div>
      </form>
    </div>
    
    <h3 class="col-12 mt-2">Selected date summary</h3>
    <div v-if="selectedDateSummary != null">
      <h4 class="col-12">Calories: {{ selectedDateSummary.TotalCalories.toFixed(2) }}</h4>
      <ul>
        <li v-for="calItem in selectedDateSummary.FoodItems" :key="calItem.Date">
          <span class="float-left">{{ calItem.Food }}</span>
          <span class="float-right ml-2">{{ calItem.Calories.toFixed(2) }} cal</span>
        </li>
      </ul>
    </div>
    <p v-else>No records for the selected date.</p>
    
    <h3 class="col-12 border-top pt-1">All dates</h3>
    <div v-if="calorieSummaries && calorieSummaries.length > 0">
      <div v-for="summary in calorieSummaries" :key="summary.Date">
        <h4 class="col-12">{{ summary.Date }}: {{ summary.TotalCalories.toFixed(2) }} cal</h4>
      </div>
    </div>
    <p v-else>No records.</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DailyFood',
  data() {
    return {
      errors: [],
      selectedFoodRecId: null,
      quantity: null,
      selectedDate: null,
      foodItems: null,
      selectedFoodData: null,
      calorieItems: null,
      calorieSummaries: null,
      selectedDateSummary: null
    }
  },
  methods: {
    fetchFoodItems() {
      fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/layouts/Food_items/records', {
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
        if(response)
          this.foodItems = response.response.data;
        // this.fetchAllCaloriesItems();
      })
      .catch(err => {
        console.log(err);
      })
    },

    fetchCalories() {
      fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/layouts/Calories/_find', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "query":[
            {"fk_user": "=" + this.userData.fieldData.PrimaryKey},
            {"CreationTimestamp": "", "omit":"true"}
            ]
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
        if(response)
          this.calorieItems = response.response.data;
        else{
          this.calorieItems = null;
          this.calorieSummaries = null;
          this.selectedDateSummary = null;
        }

        this.calcCaloriesForAllDates();
        this.setupDateSummary();
      })
      .catch(err => {
        console.log(err);
      })
    },

    addFoodForDate(e) {
      this.errors = [];

      if (!this.selectedDate) {
        this.errors.push("Date required.");
      }
      
      if (!this.selectedFoodRecId) {
        this.errors.push('Food required.');
      }
      
      if (!this.quantity) {
        this.errors.push('Quantity required.');
      } 

      if(this.errors.length == 0) {
        fetch('https://testaus.dyndns.org/fmi/data/v1/databases/Calories/layouts/Calories/records', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "fieldData":
            { 
              "fk_user": this.userData.fieldData.PrimaryKey,
              "fk_item": this.selectedFoodData.fieldData.PrimaryKey,
              "Food": this.selectedFoodData.fieldData.Food, 
              "Quantity": this.quantity,
              "Calories": this.calcCalories,
              "date" : this.date
            } 
          })
        })
        .then(response => {
          if(response.ok){
            return response.json();
          }
          else if(response.status == 401){
            this.$refs.TheLogin.refreshToken();
          }
        })
        .then(this.fetchCalories())
        .catch(err => {
          console.log(err);
        })
      }
     
     e.preventDefault();
    },

    calcCaloriesForAllDates() {
      let cals = [];
      if(this.calorieItems) {
        for(var i = 0; i < this.calorieItems.length; i++){
          let calItem = this.calorieItems[i];
          let dateToCheck = new Date(calItem.fieldData.CreationTimestamp); //date seems to be missing so we use CreationTimestamp for demo purposes
          dateToCheck.setHours(0,0,0,0);
          dateToCheck = dateToCheck.getFullYear() + "-" + (dateToCheck.getMonth() + 1) + "-" + dateToCheck.getDate();
          let inserted = false;

          //calculate total calories per date and sort by date 
          for(var x = 0; x < cals.length; x++){
            //found same date
            if(cals[x].Date == dateToCheck){
              cals[x].FoodItems.push({ 'Food':calItem.fieldData.Food, 'Calories':calItem.fieldData.Calories });
              cals[x].TotalCalories += calItem.fieldData.Calories;
              inserted = true;
              break;
            }
            //found older date so insert here
            else if(cals[x].Date < dateToCheck){
              cals.splice(x, 0, { 'Date':dateToCheck, 'TotalCalories':calItem.fieldData.Calories, 'FoodItems': [{ 'Food':calItem.fieldData.Food, 'Calories': calItem.fieldData.Calories }]});
              inserted = true;
              break;
            }
          }
          
          //if item not added yet then push as last
          if(!inserted) {
            cals.push({ 'Date':dateToCheck, 'TotalCalories':calItem.fieldData.Calories, 'FoodItems': [{ 'Food':calItem.fieldData.Food, 'Calories': calItem.fieldData.Calories }]});
          }
        }
      }
      this.calorieSummaries = cals;
    },

    setupDateSummary(){
      let calSumms = this.calorieSummaries;
      if(calSumms) {
        for(var i = 0; i < calSumms.length; i++) {
          if(calSumms[i].Date == this.selectedDate){
            this.selectedDateSummary = calSumms[i];
            return;
          }
        }
      }
      this.selectedDateSummary = null;
    }
  },
  computed: {
    ...mapState(['token', 'authenticated', 'newUserFormVisible', 'userData']),

    calcCalories(){
      let cal = 0;
      if(this.selectedFoodData && this.quantity){
        cal = this.quantity / 100.0 * this.selectedFoodData.fieldData.Calories_in_100g;
      }
      return cal;
    },
  },
  watch: {
    userData(newValue){
      if(this.authenticated && newValue != null) {
        this.selectedDateSummary = null;
        this.fetchFoodItems();
        this.fetchCalories();
      }
    },

    selectedFoodRecId(newValue) {
      if(newValue != null){
        for(var i = 0; i < this.foodItems.length; i++){
          if(this.foodItems[i].recordId == newValue) {
            this.selectedFoodData = this.foodItems[i];
            break;
          }
        }
      }
    },

    selectedDate(newValue) {
      if(newValue != null)
        this.setupDateSummary();
    }
  },
  created() {
    if(this.authenticated){
      this.fetchFoodItems();
      if(this.userData){
        this.fetchCalories();
        this.setupDateSummary();
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
