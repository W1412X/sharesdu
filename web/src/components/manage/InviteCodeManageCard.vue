
<template>
    <v-card class="manage-card invite-code-card" elevation="2">
        <v-card-title class="card-header">
            <v-icon icon="mdi-account-plus" :color="themeColor" size="24" class="header-icon"></v-icon>
            <span class="header-title">邀请码管理</span>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="card-content">
            <!-- 创建邀请码表单 -->
            <div class="form-section">
                <div class="section-title-wrapper">
                    <h3 class="section-title">创建邀请码</h3>
                </div>
                <div class="form-fields">
                    <SensitiveTextField 
                        v-model.number="createData.capacity" 
                        density="comfortable" 
                        variant="outlined"
                        label="邀请码容量(1-20)" 
                        type="number" 
                        min="1" 
                        max="20"
                        step="1"
                        class="form-field"
                        prepend-inner-icon="mdi-account-group"
                        hide-details="auto"
                        hint="请输入1-20之间的整数"
                        persistent-hint
                    />
                    <SensitiveTextField 
                        v-model.number="createData.days" 
                        density="comfortable" 
                        variant="outlined"
                        label="有效期（天）" 
                        type="number" 
                        min="1" 
                        step="1"
                        class="form-field"
                        prepend-inner-icon="mdi-calendar-clock"
                        hide-details="auto"
                        hint="请输入有效期天数"
                        persistent-hint
                    />
                </div>
                <div class="action-section">
                    <v-btn 
                        @click="createCode" 
                        :loading="loading.createCode" 
                        :disabled="loading.createCode" 
                        variant="elevated"
                        :color="themeColor"
                        size="large"
                        prepend-icon="mdi-plus-circle"
                        class="create-btn"
                    >
                        创建邀请码
                    </v-btn>
                </div>
            </div>
            
            <v-divider class="section-divider"></v-divider>
            
            <!-- 邀请码列表 -->
            <div class="table-section">
                <div class="section-title-wrapper">
                    <h3 class="section-title">邀请码列表</h3>
        </div>
                <div class="table-container">
                    <v-data-table 
                        :items="inviteCodeList" 
                        fixed-header 
                        hover
                        class="data-table"
                        :items-per-page="10"
                    >
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
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { createInvitationCode, getInvitationCodeList, updateInvitationCodeStatus } from '@/api/modules/invite';
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
                    '邀请码': response.data.code,
                    '是否可用': true,
                    '激活状态': true,
                    '创建者': getCookie("userName"),
                    '总容量': response.data.capacity,
                    '已使用': 0,
                    '剩余': response.data.remaining_capacity,
                    '创建时间': extractTime(new Date().toISOString()),
                    '过期时间': extractTime(response.data.expires_at),
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
.invite-code-card {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background-color: rgba(0, 0, 0, 0.02);
}

.header-icon {
    margin-right: 4px;
}

.header-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.card-content {
    padding: 24px;
}

.form-section {
    margin-bottom: 32px;
}

.section-title-wrapper {
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #555;
    margin: 0;
}

.form-fields {
    margin-bottom: 24px;
}

.form-field {
    margin-bottom: 20px;
    }

.form-field:last-child {
    margin-bottom: 0;
}

.action-section {
        display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.create-btn {
    min-width: 160px;
}

.section-divider {
    margin: 32px 0;
}

.table-section {
    margin-top: 0;
}

.table-container {
    overflow-x: auto;
    }

.data-table {
    width: 100%;
}

@media screen and (max-width: 768px) {
    .invite-code-card {
        max-width: 100%;
    }
    
    .card-header {
        padding: 16px 20px;
    }

    .header-title {
        font-size: 18px;
    }
    
    .card-content {
        padding: 20px 16px;
    }
    
    .form-fields {
        margin-bottom: 20px;
    }
    
    .action-section {
        justify-content: stretch;
    }
    
    .create-btn {
        width: 100%;
        min-width: unset;
    }
    
    .section-divider {
        margin: 24px 0;
    }
}
</style>