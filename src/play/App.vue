<template>
    <div id="app">
        <h1>Hi I am here to play</h1>
        <LqForm name="_test" :rules="rules">
            <template v-slot:default="{errors, model}">
                <p>Errors: {{errors}}</p>
                <p>Data Model: {{model}}</p>
                 <input type="text" v-lq-model="{id: 'name'}" value="sdhgs sgdsdhf" :keep-alive="false" id="_sdjnkj_name" />
                <select v-lq-model id="dropdown">
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>
                <select v-lq-model id="dropdown2" multiple>
                    <option value="1">One</option>
                    <option value="2" selected>Two</option>
                    <option value="3" selected>Three</option>
                </select>
                <input type="checkbox" checked v-lq-model="{id: 'vehicle1'}" id="vehicle1" name="vehicle1" value="Bike" />
                <input type="checkbox" checked v-lq-model="{id: 'vehicle1'}" id="vehicle2" name="vehicle1" value="Bike2" />

                <input type="radio"  v-lq-model="{id: 'vehicle2'}" id="vehicle3" name="vehicle2" value="Bike" />
                <input type="radio" checked v-lq-model="{id: 'vehicle2'}" id="vehicle4" name="vehicle2" value="Bike2" />
              
            </template>
        </LqForm>
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
import LqForm from './lqForm';

export default {
    name: 'play-app',
    components: { LqForm },
    data: () => {
        return {
            staticData: { since: 45 },
            table_index: 1,
            rules: {
                name: {
                    email: true,
                    presence: { allowEmpty: false }
                }
            }
        };
    },
    methods: {
        // test () {
        //     console.log('Ia dshdhsj')
        //     this.$store.dispatch('table/newItems', {
        //             tableName: 'user_',
        //             data: [{login: 'asdjgasjhdgasjhfda xhsfdhgsfh', id: Math.random().toString(36).substring(7)}]
        //         }
        //     )
        // }
    }
};
</script>
