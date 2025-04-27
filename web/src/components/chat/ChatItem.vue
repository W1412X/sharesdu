<template>
    <v-card class="card" base-color="#dddddd" @click="click" 
        :key="index" :value="data.id">
        <div class="row-div">
            <avatar-name :clickable="false" :if-show-name="false" :size="45"
                :init-data="{ id: data.id, name: data.name }"></avatar-name>
            <div class="column-div">
                <div class="msg-summary-div text-small-bold">
                    {{ data.name }}
                </div>
                <div class="msg-summary-div text-small">
                    {{ (data.lastMsg.isSelf ? '' : data.name + ' : ') + data.lastMsg.content }}
                </div>
                <div class="msg-time-div text-min">
                    {{ data.lastMsg.time }}
                </div>
            </div>
            <v-spacer></v-spacer>
            <div style="display: grid;place-items: center;">
                <v-btn  v-if="data.msgNum>0" style="margin-right: 15px;" size="20" color="error" icon :text="data.msgNum" class="text-min-bold"></v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { copy, getNormalWarnAlert } from '@/utils/other';
import AvatarName from '@/components/common/AvatarName.vue';

export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id:"",
                    name:"",
                    lastMsg:{
                        content:"",
                        time:"",
                        isSelf:false,
                    },
                    msgNum:0,
                }
            }
        }
    },
    components:{
        AvatarName,
    },
    data() {
        const data=copy(this.initData);
        return {
            data,
        }
    },
    methods: {
        click() {
            if (this.data.id && this.data.name) {
                this.$router.push({
                    name: "ChatPage",
                    params: {
                        id: this.data.id,
                        name: this.data.name,
                    }
                })
            } else {
                this.alert(getNormalWarnAlert("无发送者信息"));
            }
        },
        alert(msg){
            this.$emit('alert', msg);
        }
    },
    mounted() {
    }
}
</script>
<style scoped>
.row-div {
    display: flex;
    flex-direction: row;
    width: 100%;
}
.column-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        padding: 5px;
        display: flex;
        flex-direction: row;
    }

    .msg-summary-div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #8a8a8a;
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 600px;
        margin-top: 2px;
        margin-left: 15px;
    }
    .msg-time-div {
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 600px;
        margin-left: 15px;
        color: #8a8a8a;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 98vw;
        padding: 5px;
        display: flex;
        flex-direction: row;
    }

    .msg-summary-div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #8a8a8a;
        display: flex;
        flex-direction: row;
        width: 70vw;
        max-width: 70vw;
        margin-top: 2px;
        margin-left: 15px;
    }
    .msg-time-div {
        display: flex;
        flex-direction: row;
        width: 70vw;
        max-width: 70vw;
        margin-left: 15px;
        color: #8a8a8a;
    }
}
</style>