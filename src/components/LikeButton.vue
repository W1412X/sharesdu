<template>
    <v-btn @click="click" elevation="0" icon :style="{
        'width': size+'px',
        'height': size+'px',
        'border-radius': '100%',
    }">
        <v-icon :color="color" :size="size" :icon="heart"></v-icon>
    </v-btn>
</template>
<script>
import { computed } from 'vue';
export default{
    props:{
        type:{
            type:String,
            default:'answer',
        },
        id:{
            type:String,
            default:'00000000',
        },
        state:{
            type:Boolean,
            default:false,
        },
        size:{
            type:String,
            default:'24',
        },
    },
    data(){
        const ifClicked=this.state;
        const color=computed(()=>{
            return this.ifClicked?'#db261f': '#8a8a8a';
        })
        const heart=computed(()=>{
           return this.ifClicked? 'mdi-heart':'mdi-heart-outline';
        });
        return {
            color,
            ifClicked,
            heart,
            ifClickable:true,
        }
    },
    components:{
    },
    methods:{
        click(){
            if(!this.ifClickable)return;
            this.ifClicked=!this.ifClicked;
            this.ifClickable=false;
            console.log('type',this.type);
            console.log('id',this.id);
            setTimeout(()=>{
                this.ifClickable=true;
            },2000)
        }
    }
}
</script>