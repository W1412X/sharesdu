<template>
    <v-btn
        @click="toTagPage()"
        :color=themeColor
        :variant="variant"
        density="compact"
        class="tag text-small">
            {{ data }}
    </v-btn>
</template>
<script>
import { globalProperties } from '@/main'
import { openPage } from '@/utils/other';
export default{
    props:{
        data:{//tag string
            type:String,
            required: true 
        },
        variant:{
            type:String,
            default:"tonal"
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
            openPage("router",{
                path: '/search',
                query: {
                    type: 'all',
                    query: this.data
                }
            });
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
    line-height: 0%;
    color: var(--theme-color);
}
@media screen and (min-width: 1000px) {

}

@media screen and (max-width: 1000px) {
}
</style>