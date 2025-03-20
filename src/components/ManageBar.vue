<template>
    <div class="row-div">
        <v-btn @click="click" elevation="0" icon :style="{
                'width': size + 'px',
                'height': size + 'px',
                'border-radius': '100%',
            }">
        <v-icon :color="color" :size="size" :icon="heart"></v-icon>
    </v-btn>
    </div>
</template>
<script>
export default{
    name:"ManageBar",
    props:{
        type:{
            type:String,//post article course reply  
            default:null
        },
        id:{
            type:String,
            default:null
        },
        authorId:{
            type:String,
            default:null
        },
        size:{
            type:String,
            default:'24'
        }
    }
}
</script>
<style scoped>
.margin-left-5px{
    margin-left: 5px;
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>