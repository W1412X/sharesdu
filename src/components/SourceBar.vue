<template>
    <v-card
      color="rgba(0,0,0,0.3)"
      @click="downloadSource"
      style="padding: 5px;margin:5px"
      variant="outlined"
    >
      <div style="display: flex; flex-direction: row">
        <v-icon icon="mdi-paperclip" size="20"></v-icon>
        <span style="font-size: 18px; color: #8a8a8a;font-size: 14px;margin-left:10px;font-weight: 600;"
          >{{ initData.name }}</span
        >
      </div>
    </v-card>
</template>
<script>
import { openNewPage } from '@/utils/other'

export default {
    props: {
        initData:{
            type: Object,
            default: () => {
                return {
                    name:null,
                    link:null,
                }
            },
        }
    },
    components: {
    },
    data() {
        return {
        }
    },
    methods: {
        downloadSource() {
            openNewPage(this.initData.link);
        },
    },
}
</script>
<style scoped>
.card{
    width:100%;
    padding:5px;
    margin:5px;
}
@media screen and (min-width: 600px) {
    
}

@media screen and (max-width: 600px) {
}
</style>