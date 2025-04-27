<!--alert button-->
<template>
    <v-btn elevation="0" @click="click" icon :style="{
        'width': size+'px',
        'height': size+'px',
        'color': color,
        'background-color': 'rgba(0,0,0,0)',
    }">
        <v-icon :size="size" icon="mdi-shield-edit-outline"></v-icon>
        <v-tooltip activator="parent" :text="'对此文章执行管理操作'"></v-tooltip>
    </v-btn>
</template>
<script>
export default {
    props: {
        id: {
            type: String,
            default: '00000000',
        },
        type: {
            type: String,
            default: 'article',
        },
        size: {
            type: String,
            default: '25',
        },
        color: {
            type: String,
            default: '#8a8a8a',
        }
    },
    components: {
    },
    setup() {
        return {
        }
    },
    methods: {
        click() {
            this.$router.push({
                name:'ManagePage',
                query:{
                    init_id:this.id,
                    init_type:this.type,
                }
            });
        },
        close() {
        }
    }
}
</script>