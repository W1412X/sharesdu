<!--star button-->
<template>
    <v-card @click="click()" class="card" elevation="5">
        <div class="div-2">
            <v-icon :icon="getIcon(this.data.type)" style="margin-right: 20px;margin-left: 5pxz;" color="grey"/>
            <div class="div-1 ">
                <div class="title-container title-bold">
                    {{ data.title }}
                </div>
                <div class="time-container text-small">
                    {{ data.time }}
                </div>
            </div>
        </div>
    </v-card>
</template>

<script>
export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,//article,course,post
                    id: null,
                    title: null,
                    time: null,
                }
            }
        }
    },
    data() {
        const data = this.initData;
        return {
            data,
            ifStar: true,
        };
    },
    components: {
    },
    methods: {
        click(){
            switch(this.data.type){
                case 'article':
                    this.$router.push({ name: 'ArticlePage', params: { id: this.data.id } });
                    break;
                case 'course':
                    this.$router.push({ name: 'CoursePage', params: { id: this.data.id } });
                    break;
                case 'post':
                    this.$router.push({ name: 'PostPage', params: { id:this.data.id } });
            }
        },
        getIcon(type) {
            switch (type) {
                case 'article':
                    return 'mdi-file-document-outline';
                case 'course':
                    return 'mdi-book-outline';
                case 'post':
                    return "mdi-comment-question-outline"
            }
            return "mdi-star"
        },
    }
}
</script>
<style scoped>
    .title-container{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 80%;
    }
    .time-container{
        color:grey;
        margin-top:0px;
    }
@media screen and (min-width: 600px) {
    .card {
        padding: 5px;
        width: 750px;
    }
    .div-1 {
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

@media screen and (max-width: 600px) {
    .card {
        padding: 3px;
        width: 100vw;
    }
    .div-1 {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}
</style>