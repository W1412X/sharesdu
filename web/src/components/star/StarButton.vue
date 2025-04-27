<!--star button-->
<template>
    <v-dialog v-model="ifShowDialog" style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
        <div v-if="ifShowStarCard" style="width: 100%;height:100%;justify-content: center;display: flex">
            <star-card @set_loading="setLoading" @close="setStarCardState(false)" @alert="alert" @star_ok="starOk" :type="'add'" :msg="{type:type,id:id}"/>
        </div>
    </v-dialog>
    <v-btn @click="handleClick" elevation="0" icon :style="{
        'max-width': size+'px',
        'max-height': size+'px',
        'border-radius': '100%',
        'background-color':'rgba(0,0,0,0)'
    }">
        <v-icon type="mdi" :size="size" :color="color" :icon="star"></v-icon>
    </v-btn>
</template>

<script>
import { computed, ref } from 'vue';
import StarCard from '@/components/star/StarCard.vue';
import { unstarContent } from '@/axios/star';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalWarnAlert } from '@/utils/other';

export default {
    props: {
        state: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: null,
        },
        id: {
            type: String,
            default: '00000000',
        },
        size: {
            type: String,
            default: '25',
        },
    },
    components:{
        StarCard,
    },
    setup(){
        const ifShowStarCard=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowStarCard.value;
        })
        const setStarCardState=(state)=>{
            ifShowStarCard.value=state;
        }
        return {
            ifShowDialog,
            ifShowStarCard,
            setStarCardState,
        }
    },
    data() {
        return {
            ifClicked: this.state,
            color: computed(() => this.ifClicked ? '#ffac33' : '#8a8a8a'),
            star: computed(() => this.ifClicked ? 'mdi-star' : 'mdi-star-outline'),
            isClickable: true, //to judge  if clickable
        };
    },
    methods: {
        async handleClick() {
            if (!this.isClickable) return; //if not clickable return
            this.isClickable = false; //set clickable to false
            if(this.ifClicked){
                let type=-1;
                switch(this.type){
                    case 'article':
                        type=1;
                        break;
                    case 'course':
                        type=0;
                        break;
                    case 'post':
                        type=2;
                        break;
                    default:
                        type=-1;
                        break;
                }
                this.setLoading(getLoadMsg("正在取消收藏..."));
                let response=await unstarContent(type,this.id);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalWarnAlert('取消收藏成功'));
                    this.ifClicked=false;
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }else{
                this.setStarCardState(true);
            }
            //out type and id
            //set clickable to true after 2s
            setTimeout(() => {
                this.isClickable = true;
            }, 2000);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        starOk(){
            this.setStarCardState(false);
            this.ifClicked=true;
        }
    }
}
</script>