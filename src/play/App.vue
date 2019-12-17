<template>
    <div id="app">
        <h1>Hi I am here to play </h1>
        <lq-list name="user_" action="https://api.github.com/users" :defaultPageSize="30" :transformKeys="['page_size:_page_re']" :data-key="null" :static-data="staticData">
            <template slot-scope="scope">
                <p v-for="(item, index) in scope.items" :key="`test_${index}`">
                    {{item.login}} {{item.id}} {{scope.newIds}}
                </p>
                <button @click="scope.next()" type="button">Next </button>
                <button @click="table_index++" type="button">Change Name</button>

            </template>
           
        </lq-list>
        <button @click="test">Add New Item</button>
        <button type="button" @click="staticData =  { since: 1}">Change Static Data</button>
    </div>
</template>
<script>
export default {
    name: 'play-app',
    data: () => {
       return  {
            staticData: { since: 45 },
            table_index: 1
        }
    },
    methods: {
        test () {
            console.log('Ia dshdhsj')
            this.$store.dispatch('table/newItems', { 
                    tableName: 'user_',
                    data: [{login: 'asdjgasjhdgasjhfda xhsfdhgsfh', id: Math.random().toString(36).substring(7)}]
                }
            )
        }
    }
}
</script>
