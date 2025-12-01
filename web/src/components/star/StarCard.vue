<template>
    <!-- 新建收藏夹对话框 -->
    <v-dialog v-model="ifShowDialog" class="folder-editor-dialog">
        <div v-if="ifShowFolderEditor" class="dialog-wrapper">
            <v-card class="dialog-card" elevation="1">
                <div class="dialog-header">
                    <div class="dialog-title">新建收藏夹</div>
                    <v-btn size="small" color="#8a8a8a" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
                </div>
                <sensitive-text-field 
                    v-model="newFolder.name" 
                    label="收藏夹标题" 
                    density="compact" 
                    rows="1"
                    variant="outlined"
                    class="dialog-field"
                ></sensitive-text-field>
                <sensitive-text-area 
                    v-model="newFolder.description" 
                    variant="outlined" 
                    rows="3"
                    label="收藏夹描述"
                    class="dialog-field"
                ></sensitive-text-area>
                <div class="dialog-actions">
                    <v-btn 
                        :loading="loading.create" 
                        :disabled="loading.create" 
                        @click="create" 
                        :color="themeColor" 
                        variant="tonal"
                    >确认创建</v-btn>
                    <v-btn 
                        @click="closeDialog()" 
                        variant="text"
                    >取消</v-btn>
                </div>
            </v-card>
        </div>
    </v-dialog>

    <!-- 收藏夹详情对话框 -->
    <v-dialog v-model="ifShowFolderDetail" class="folder-detail-dialog">
        <div v-if="selectedFolder" class="dialog-wrapper">
            <v-card class="folder-detail-card" elevation="1">
                <div class="folder-detail-header">
                    <div class="folder-detail-title">
                        <v-icon :color="themeColor" icon="mdi-folder-star" size="24"></v-icon>
                        <span class="folder-name">{{ selectedFolder.name }}</span>
                    </div>
                    <v-btn 
                        size="small" 
                        color="#8a8a8a" 
                        variant="text" 
                        icon="mdi-close" 
                        @click="closeFolderDetail()"
                    ></v-btn>
                </div>
                
                <!-- 收藏夹信息 -->
                <div class="folder-info">
                    <div v-if="selectedFolder.description" class="folder-description">
                        {{ selectedFolder.description }}
                    </div>
                    <div class="folder-meta">
                        <div class="meta-item">
                            <v-icon :color="'#8a8a8a'" icon="mdi-clock" size="18"></v-icon>
                            <span class="meta-text">{{ selectedFolder.createTime }}</span>
                        </div>
                        <div class="meta-item">
                            <v-icon :color="'#8a8a8a'" icon="mdi-star" size="18"></v-icon>
                            <span class="meta-text">{{ selectedFolder.starNum }} 个收藏</span>
                        </div>
                    </div>
                </div>

                <!-- 收藏项目列表 -->
                <div class="folder-items-container">
                    <div v-if="selectedFolder.items.length === 0" class="empty-state">
                        <v-icon :color="'#8a8a8a'" icon="mdi-inbox-outline" size="48"></v-icon>
                        <p class="empty-text">暂无收藏项目</p>
                    </div>
                    <div v-else class="folder-items-list">
                        <star-item 
                            v-for="(item, index) in selectedFolder.items" 
                            :key="index"
                            :init-data="item"
                            class="folder-item"
                        ></star-item>
                    </div>
                </div>
            </v-card>
        </div>
    </v-dialog>

    <!-- 主界面 -->
    <part-loading-view :state="!loadState"></part-loading-view>
    <v-card v-if="loadState" class="card" elevation="1">
        <div class="card-header">
            <div class="card-title">我的收藏夹</div>
            <v-btn 
                v-if="type === 'add'" 
                size="small" 
                color="#8a8a8a" 
                variant="text"
                icon="mdi-close" 
                @click="close"
            ></v-btn>
        </div>
        <v-btn 
            class="create-folder-btn"
            @click="setFolderEditorState(true)" 
            prepend-icon="mdi-plus" 
            :color="themeColor"
            variant="tonal"
        >新建收藏夹</v-btn>
        
        <!-- 收藏夹列表 -->
        <div class="folders-list">
            <div v-if="folders.length === 0" class="empty-state">
                <v-icon :color="'#8a8a8a'" icon="mdi-folder-outline" size="64"></v-icon>
                <p class="empty-text">暂无收藏夹</p>
                <p class="empty-hint">点击上方按钮创建第一个收藏夹</p>
            </div>
            <v-card
                v-for="(folder, index) in folders"
                :key="folder.id"
                class="folder-card"
                @click="openFolderDetail(index)"
                elevation="1"
            >
                <div class="folder-card-content">
                    <div class="folder-card-header">
                        <v-icon :color="themeColor" icon="mdi-folder-star" size="28"></v-icon>
                        <div class="folder-card-title">{{ folder.name }}</div>
                        <v-spacer></v-spacer>
                        <v-btn 
                            v-if="type === 'add'"
                            :loading="loading.add[folder.id]" 
                            :disabled="loading.add[folder.id]" 
                            @click.stop="add(folder.id)" 
                            :color="themeColor" 
                            icon="mdi-star-plus"
                            variant="tonal" 
                            size="small"
                        ></v-btn>
                    </div>
                    <div v-if="folder.description" class="folder-card-description">
                        {{ folder.description }}
                    </div>
                    <div class="folder-card-meta">
                        <div class="meta-item">
                            <v-icon :color="'#8a8a8a'" icon="mdi-clock" size="16"></v-icon>
                            <span class="meta-text">{{ folder.createTime }}</span>
                        </div>
                        <div class="meta-item">
                            <v-icon :color="'#8a8a8a'" icon="mdi-star" size="16"></v-icon>
                            <span class="meta-text">{{ folder.starNum }} 个收藏</span>
                        </div>
                    </div>
                </div>
            </v-card>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import StarItem from '@/components/star/StarItem.vue';
import { formatRelativeTime, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { createStarFolder, getStarFolders, getStarList, starContent } from '@/api/modules/star';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
export default {
    props: {
        type: {
            type: String,
            default: "add",//add / show  
        },
        msg: {
            type: Object,
            default: () => {
                return {
                    type: 'article',//article,course,post  
                    id: null,
                }
            }
        }
    },
    components: {
        StarItem,
        SensitiveTextArea,
        SensitiveTextField,
        PartLoadingView,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const ifShowFolderEditor = ref(false);
        const ifShowFolderDetail = ref(false);
        const selectedFolderIndex = ref(-1);
        const ifShowDialog = computed(() => {
            return ifShowFolderEditor.value;
        })
        const setFolderEditorState = (state) => {
            ifShowFolderEditor.value = state;
        }
        return {
            themeColor,
            ifShowDialog,
            ifShowFolderEditor,
            ifShowFolderDetail,
            selectedFolderIndex,
            setFolderEditorState
        }
    },
    data() {
        return {
            folders: [],
            newFolder: {
                name: "",
                description: "",
            },
            loading:{
                create:false,
                add:{},
                load:{},
            },
            loadState:false,
        }
    },
    methods: {
        async create() {
            this.loading.create=true;
            let response = await createStarFolder(this.newFolder.name, this.newFolder.description);
            this.loading.create=false;
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("创建成功"));
                this.folders.unshift({
                    name: this.newFolder.name,
                    description: this.newFolder.description,
                    id: response.folder_id,
                    starNum: 0,
                    createTime: new Date().toLocaleString(),
                    items: []
                })
                this.newFolder.name = "";
                this.newFolder.description = "";
                this.setFolderEditorState(false);
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadFolderItems(index) {
            if (this.folders[index].items.length != 0) {
                return; // 已加载，直接返回
            }
            this.loading.load[index] = true;
            let response = await getStarList(this.folders[index].id);
            this.loading.load[index] = false;
            if (response.status == 200 || response.status == 201) {
                try {
                    for (let u = 0; u < response.star_list.length; u++) {
                        let type = null;
                        switch (response.star_list[u].content_type) {
                            case 1:
                                type = "article";
                                break;
                            case 0:
                                type = "course";
                                break;
                            case 2:
                                type = "post";
                                break;
                        }
                        this.folders[index].items.push({
                            id: response.star_list[u].content_id,
                            title: response.star_list[u].content_name,
                            type: type,
                            time: response.star_list[u].created_at,
                        });
                    }
                } catch (e) {
                    // eslint-disable-next-line
                }
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        openFolderDetail(index) {
            this.selectedFolderIndex = index;
            this.ifShowFolderDetail = true;
            // 自动加载收藏项目
            this.loadFolderItems(index);
        },
        closeFolderDetail() {
            this.ifShowFolderDetail = false;
            this.selectedFolderIndex = -1;
        },
        async add(folderId) {
            this.loading.add[folderId]=true;
            let type = -1;
            switch (this.msg.type) {
                case "course":
                    type = 0;
                    break;
                case "article":
                    type = 1;
                    break;
                case "post":
                    type = 2;
                    break;
                default:
                    type = -1;
                    break;
            }
            let response = await starContent(type, this.msg.id, folderId);
            this.loading.add[folderId]=false;
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("收藏成功"));
                this.$emit('star_ok');
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        closeDialog() {
            this.setFolderEditorState(false);
        },
        close() {
            this.$emit('close');
        }
    },
    computed: {
        selectedFolder() {
            if (this.selectedFolderIndex >= 0 && this.selectedFolderIndex < this.folders.length) {
                return this.folders[this.selectedFolderIndex];
            }
            return null;
        }
    },
    async mounted() {
        this.loadState=false;
        let response = await getStarFolders();
        this.loadState=true;
        if (response.status == 200) {
            for (let i = 0; i < response.folders.length; i++) {
                this.folders.push({
                    id: response.folders[i].id,
                    name: response.folders[i].name,
                    description: response.folders[i].description,
                    starNum: response.folders[i].star_count,
                    createTime: formatRelativeTime(response.folders[i].created_at),
                    items: []
                })
            }
            this.alert(getNormalSuccessAlert('加载成功'));
        } else {
            this.alert(getNormalErrorAlert(response.message));
        }
    }
}
</script>
<style scoped>
/* 主卡片样式 */
.card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-shrink: 0;
}

.card-title {
    font-size: var(--font-size-title);
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
}

.create-folder-btn {
    width: 100%;
    margin-bottom: 16px;
    flex-shrink: 0;
}

/* 收藏夹列表 */
.folders-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 600px;
    overflow-y: auto;
    min-height: 0;
    flex: 1;
}

.folder-card {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    min-height: fit-content;
}

.folder-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.folder-card-content {
    padding: 16px;
}

.folder-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.folder-card-title {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
    flex: 1;
}

.folder-card-description {
    font-size: var(--font-size-small);
    color: #8a8a8a;
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

.folder-card-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.meta-text {
    font-size: var(--font-size-tiny);
    color: #8a8a8a;
}

/* 对话框样式 */
.folder-editor-dialog,
.folder-detail-dialog {
    z-index: 1000;
}

.dialog-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    max-width: 100vw;
}

.dialog-card {
    width: 100%;
    max-width: 500px;
    padding: 20px;
    border-radius: 12px;
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.dialog-title {
    font-size: var(--font-size-title);
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
}

.dialog-field {
    margin-bottom: 16px;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
}

/* 收藏夹详情对话框 */
.folder-detail-card {
    width: 100%;
    max-width: 700px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden; /* 防止内容溢出 */
    box-sizing: border-box;
}

.folder-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.folder-detail-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.folder-name {
    font-size: var(--font-size-title);
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
}

.folder-info {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.folder-description {
    font-size: var(--font-size-medium);
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.5;
    margin-bottom: 12px;
}

.folder-meta {
    display: flex;
    align-items: center;
    gap: 20px;
}

.folder-items-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden !important; /* 防止横向滚动 */
    padding: 16px;
    min-height: 200px;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    position: relative;
}

.folder-items-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important; /* 允许 flex 子元素收缩 */
    box-sizing: border-box !important;
    overflow: hidden !important;
}

.folder-item {
    width: 100% !important;
    min-width: 0 !important; /* 允许 flex 子元素收缩 */
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

/* 深度选择器覆盖 v-card 默认样式 */
.folder-item :deep(.v-card) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #8a8a8a;
}

.empty-text {
    font-size: var(--font-size-medium);
    color: #8a8a8a;
    margin-top: 16px;
    margin-bottom: 8px;
}

.empty-hint {
    font-size: var(--font-size-small);
    color: #8a8a8a;
    text-align: center;
}

/* PC 端样式 */
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        max-height: 800px;
        overflow: hidden;
    }

    .folders-list {
        max-height: 650px;
        min-height: 0;
    }

    .folder-detail-card {
        max-width: 800px;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        max-height: 90vh;
        overflow: hidden;
    }

    .folders-list {
        max-height: calc(90vh - 120px);
        min-height: 0;
    }

    .dialog-wrapper {
        padding: 12px;
    }

    .dialog-card,
    .folder-detail-card {
        max-width: 100%;
        max-height: 90vh;
    }

    .folder-detail-header,
    .folder-info {
        padding: 16px;
    }

    .folder-items-container {
        padding: 12px;
    }
}
</style>