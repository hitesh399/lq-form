<template>
    <div id="app">
        <h1>Hi I am here to play </h1>
        <lq-list :name="`user${table_index}`" action="https://api.github.com/users" :data-key="null" :static-data="staticData">
            <template slot-scope="scope">
                <p v-for="(item) in scope.items" :key="item.id">
                    {{item.login}}
                </p>
                <button @click="scope.next()" type="button">Next </button>
                <button @click="table_index++" type="button">Change Name</button>

            </template>
           
        </lq-list>
        <button type="button" @click="staticData =  { since: 1}">Change Static Data</button>
    </div>
</template>
<script>
export default {
    name: 'play-app',
    data: () => {
       return  {
            staticData: { since: 45},
            table_index: 1
        }
    }
}
</script>
