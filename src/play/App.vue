<template>
    <div id="app">
        <h1>Hi I am here to play</h1>
        <lq-form name="_test" :rules="rules">
            <template v-slot:default="{errors, model}">
                <p>Errors: {{errors}}</p>
                <p>Data Model: {{model}}</p>
                <input
                    type="text"
                    v-lq-model="name"
                    value="sdhgs sgdsdhf"
                    :keep-alive="false"
                    id="name"
                />
                 <!-- <select v-lq-model id="dropdown">
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>
                <select v-lq-model id="dropdown2" multiple>
                    <option value="1">One</option>
                    <option value="2" >Two</option>
                    <option value="3" selected>Three</option>
                </select>
                <input type="checkbox"  v-lq-model="{id: 'vehicle1'}" id="vehicle1" name="vehicle1" value="Bike" />
                <input type="checkbox"  v-lq-model="{id: 'vehicle1'}" id="vehicle2" name="vehicle1" value="Bike2" />

                <input type="radio"  v-lq-model="{id: 'vehicle2'}" id="vehicle3" name="vehicle2" value="Bike" />
                <input type="radio" checked v-lq-model="{id: 'vehicle2'}" id="vehicle4" name="vehicle2" value="Bike2" />
                -->
            </template>
        </lq-form>
        <button type="button" @click.prevent="test">Init</button>
        <!-- <lq-list name="user_" action="https://api.github.com/users" :defaultPageSize="30" :transformKeys="['page_size:_page_re']" :data-key="null" :static-data="staticData">
            <template slot-scope="scope">
                <p v-for="(item, index) in scope.items" :key="`test_${index}`">
                    {{item.login}} {{item.id}} {{scope.newIds}}
                </p>
                <button @click="scope.next()" type="button">Next </button>
                <button @click="table_index++" type="button">Change Name</button>

            </template>
           
        </lq-list>
        <button @click="test">Add New Item</button>
        <button type="button" @click="staticData =  { since: 1}">Change Static Data</button>-->
    </div>
</template>
<script>
export default {
    name: 'play-app',
    data: () => {
        return {
            staticData: { since: 45 },
            table_index: 1,
            name: 'd',
            rules: {
                name: {
                    email: true,
                    presence: { allowEmpty: false }
                }
            }
        };
    },
    methods: {
        test() {
            this.$lqForm.initializeValues('_test', {
                name: 'I am here to check Init.',
                dropdown2: ["1","2"],
                vehicle1: "Bike",
                vehicle2: ["Bike"],
                dropdown: "3"
            });
        }
    }
};
</script>
