
<template>
    <v-card class="card column-div-scroll">
        <div>
            <SensitiveTextField v-model="createData.capacity" density="compact" variant="outlined"
                v-model.number="newCapacity" :label="'邀请码容量(1-20)'" type="number" min="1" step="1" />
            <SensitiveTextField v-model="createData.days" density="compact" variant="outlined"
                v-model.number="newExpiresDays" :label="'有效期（天）'" type="number" min="1" step="1" />
            <v-btn @click="createCode" :loading="loading.createCode" :disabled="loading.createCode" width="100%"
                variant="outlined" :color="themeColor">确认创建</v-btn>
        </div>
        <v-data-table :items="inviteCodeList" fixed-header hover>
            <!-- bug but can run -->
            <template v-slot:[`item.激活状态`]="{ item }">
                <v-switch
                    v-model="item.激活状态"
                    :color="themeColor"
                    hide-details
                    @change="setCodeState(item.邀请码)"
                    width="100px"
                >
                <template v-slot:label>
                    <v-progress-circular
                        v-if="loading.codeState[item.邀请码]"
                        class="ms-2"
                        :indeterminate="loading.codeState[item.邀请码]"
                        :color="themeColor"
                        size="24"
                    ></v-progress-circular>
                </template>
            </v-switch>
            </template>
            <template v-slot:[`item.是否可用`]="{ item }">
                <v-icon :icon="item.是否可用?'mdi-check-bold':'mdi-close-thick'" :color="item.是否可用?'success':'error'"></v-icon>
            </template>
        </v-data-table>
    </v-card>

</template>
<script>
import { globalProperties } from '@/main';
import SensitiveTextField from './SensitiveTextField.vue';
import { createInvitationCode, getInvitationCodeList, updateInvitationCodeStatus } from '@/axios/invite';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, getNormalWarnAlert } from '@/utils/other';
import { getCookie } from '@/utils/cookie';
export default {
    setup() {
        return {
            themeColor: globalProperties.$themeColor,
        }
    },
    components: {
        SensitiveTextField,
    },
    data() {
        return {
            createData: {
                capacity: null,
                days: null,
            },
            inviteCodeList: [],
            loading: {
                createCode: false,
                loadCode: false,
                codeState:{

                }
            }
        }
    },
    methods: {
        async createCode() {
            if (this.createData.capacity == null || this.createData.days == null) {
                this.alert(getNormalInfoAlert("请填写完整信息"))
                return
            }
            this.loading.createCode = true;
            let response = await createInvitationCode(this.createData.capacity, this.createData.days);
            this.loading.createCode = false;
            if (response.status == 200) {
                this.alert(getNormalSuccessAlert("创建成功"));
                this.inviteCodeList.unshift({
                    code: response.code,
                    creator: getCookie("userName"),
                    capacity: response.capacity,
                    used_count: 0,
                    remaining_capacity: response.remaining_capacity,
                    created_at: extractTime(new Date().toDateString()),
                    expires_at: response.expires_at,
                    is_active: true,
                    is_usable: true,
                })
                this.alert(getNormalSuccessAlert("创建成功"));
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async getCodeList() {
            this.loading.loadCode = true;
            let response = await getInvitationCodeList();
            this.loading.loadCode = false;
            if (response.status == 200) {
                for(let i=0;i<response.data.length;i++){
                    this.inviteCodeList.push({
                        "邀请码":response.data[i].code,
                        "是否可用":response.data[i].is_usable,
                        "激活状态":response.data[i].is_active,
                        "创建者":response.data[i].creator,
                        "总容量":response.data[i].capacity,
                        "已使用":response.data[i].used_count,
                        "剩余":response.data[i].remaining_capacity,
                        "创建时间":extractTime(response.data[i].created_at),
                        "过期时间":extractTime(response.data[i].expires_at),
                    })
                }
                this.alert(getNormalSuccessAlert("获取成功"));
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async setCodeState(code) {
            let opInd=-1;
            for(let i=0;i<this.inviteCodeList.length;i++){
                if(this.inviteCodeList[i]['邀请码']==code){
                    opInd=i;
                    break;
                }
            }
            if(opInd==-1){
                this.alert(getNormalWarnAlert("未找到此邀请码"));
                return;
            }
            this.loading.codeState[code]=true;
            let response=await updateInvitationCodeStatus(code,this.inviteCodeList[opInd]['激活状态']);
            this.loading.codeState[code]=false;
            if(response.status==200){
                this.alert(getNormalSuccessAlert(this.inviteCodeList[opInd]['激活状态']?"已激活":"已取消激活"));
            }else{
                this.alert(getNormalErrorAlert(response.message));
                this.inviteCodeList[opInd]['激活状态']=!this.inviteCodeList[opInd]['激活状态'];
            }
        },
        alert(msg) {
            this.$emit("alert", msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
    },
    async mounted() {
        this.setLoading(getLoadMsg('正在加载邀请码...'))
        await this.getCodeList();
        this.setLoading(getCancelLoadMsg())
    }
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .card {
        margin: 20px;
        width: 750px;
        max-height: 800px;
        padding: 20px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        overflow: auto;
    }

}

@media screen and (max-width: 1000px) {
    .card {
        width: 90vw;
        max-height: 90vh;
        padding: 15px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        overflow: auto;
    }
}
</style>