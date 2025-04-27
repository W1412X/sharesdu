<template>
    <v-card class="card" elevation="5">
        <iframe id=“frame”  :src="url"  style="width: 600px;height: 100%;"></iframe>
    </v-card>
</template>
<script>
export default {
    name: 'WebCard',
    props: {
        url: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {};
    },
    mounted(){

    }
};
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .card{
        width: 600px;
        height: 800px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .container{
        width: 600px;
        height: 100%;
    }
}

@media screen and (max-width: 1000px) {
    .card{
        width: 80vw;
        height: 60vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .container{
        width: 80vw;
        height: 100%;
    }
}
</style>