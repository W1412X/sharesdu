<template>
    <v-btn
        @click="toTagPage()"
        :color=themeColor
        variant="tonal"
        density="compact"
        class="tag text-small">
            {{ data }}
    </v-btn>
</template>
<script>
import { globalProperties } from '@/main'
export default{
    props:{
        data:{//tag string
            type:String,
            required: true 
        }
    },
    setup(){
      const themeColor=globalProperties.$themeColor;  
      return {
        themeColor,
      }
    },
    methods:{
        toTagPage(){//need a search page 
            window.alert("搜索标签"+this.data);
        }
    }
}
</script>
<style scoped>
.tag{
    height: 20px;
    margin-left: 5px;
    padding-left:5px;
    padding-right:5px;
    min-width:0px;
    color: var(--theme-color);
}
@media screen and (min-width: 1000px) {

}

@media screen and (max-width: 1000px) {
}
</style>