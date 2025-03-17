<template>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
        <div v-if="ifShowFolderEditor" style="width: 100%;height:100%;justify-content: center;display: flex">
            <v-card class="card" elevation="1">
                <div class="row-reverse-div" style="margin-bottom: 10px;">
                    <v-btn size="20" color="#8a8a8a" variant="text" icon="mdi-close" @click="closeDialog()"></v-btn>
                </div>
                <sensitive-text-field v-model="newFolder.name" label="编辑收藏夹标题" density="compact" rows="1"
                    variant="outlined"></sensitive-text-field>
                <sensitive-text-area v-model="newFolder.description" variant="outlined" rows="3"
                    label="编辑收藏夹描述"></sensitive-text-area>
                <div class="row-reverse-div">
                    <v-btn @click="create" :color="themeColor" variant="outlined">确认创建</v-btn>
                </div>
            </v-card>
        </div>
    </v-dialog>

    <v-card class="card" elevation="1">
        <div class="row-reverse-div">
        <v-btn v-if="type === 'add'" size="20" style="margin-bottom: 10px;" color="#8a8a8a" variant="text" icon="mdi-close" @click="close"></v-btn>
                </div>
        <v-btn style="width: 100%;" @click="setFolderEditorState(true)" prepend-icon="mdi-plus" :color="themeColor"
        variant="tonal">新建收藏夹</v-btn>
        <div class="column-div-scroll">
            <v-expansion-panels>
                <v-expansion-panel expand-icon="mdi-folder-star" v-for="(folder, index) in folders" :key="index"
                    class="with-border"
                    :text="folder.description" :title="folder.name">
                    <div class="row-reverse-div">
                        <v-btn v-if="type === 'add'" @click="add(folder.id)" :color="themeColor" icon="mdi-star-plus" class="btn"
                            variant="tonal" size="30"></v-btn>
                        <v-btn v-if="type === 'show'" @click="load(folder.id)" :color="themeColor" icon="mdi-chevron-down-circle-outline"
                            class="btn" variant="tonal" size="32"></v-btn>
                        <v-spacer></v-spacer>
                        <div class="row-60-scroll">
                            <div class="row-div">
                                <v-icon class="icon-right-5px icon-left-10px" :color="'#8a8a8a'" icon="mdi-clock" size="20"></v-icon>
                                <div class="text-medium"  :style="{ 'color':'#8a8a8a' }">
                                    {{ folder.createTime }}
                                </div>
                                <v-icon class="icon-right-5px icon-left-10px" :color="'#8a8a8a'" icon="mdi-star" size="20"></v-icon>
                                <div class="text-medium" :style="{ 'color':'#8a8a8a' }">
                                    {{ folder.starNum }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item-container">
                        <star-item style="width: auto;" v-for="(item, index) in folder.items" :init-data="item"
                            :key="index"></star-item>
                    </div>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import StarItem from './StarItem.vue';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert } from '@/utils/other';
import { createStarFolder, getStarFolders, getStarList, starContent } from '@/axios/star';
import { computed, ref } from 'vue';
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
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
        SensitiveTextField
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const ifShowFolderEditor = ref(false);
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
            setFolderEditorState
        }
    },
    data() {
        return {
            folders: [],
            newFolder: {
                name: "",
                description: "",
            }
        }
    },
    methods: {
        async create() {
            this.setLoading(getLoadMsg("正在创建..."));
            let response = await createStarFolder(this.newFolder.name, this.newFolder.description);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("创建成功"));
                this.folders.unshift({
                    name: this.newFolder.name,
                    description: this.newFolder.description,
                    id: response.folder_id,
                    starNum: 0,
                    createTime: new Date().toLocaleString(),
                    items:[]
                })
                this.newFolder.name = "";
                this.newFolder.description = "";
                this.setFolderEditorState(false);
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async load(folderId) {
            for(let i=0;i<this.folders.length;i++){
                if(this.folders[i].id==folderId){
                    if(this.folders[i].items.length!=0){
                        this.alert(getNormalInfoAlert("文件夹已加载"))
                        return;
                    }
                }
            }
            this.setLoading(getLoadMsg("正在加载收藏夹列表..."));
            let response = await getStarList(folderId);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200 || response.status == 201) {
                try{
                    for(let i=0;i<this.folders.length;i++){
                    if(this.folders[i].id==folderId){
                        for(let u=0;u<response.star_list.length;u++){
                            let type=null;
                            switch(response.star_list[u].content_type){
                                case 0:
                                    type="article";
                                    break;
                                case 1:
                                    type="course";
                                    break;
                                case 2:
                                    type="post";
                                    break;
                            }
                            this.folders[i].items.push({
                                id:response.star_list[u].content_id,
                                title:response.star_list[u].content_name,
                                type:type,
                                time:response.star_list[u].created_at,
                            });
                        }
                        break;
                    }
                }
                }catch (e) {
                    console.log(e);
                }
                this.alert(getNormalSuccessAlert("成功加载收藏"));
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async add(folderId) {
            this.setLoading(getLoadMsg("正在添加..."));
            let type=-1;
            switch(this.msg.type){
                case "course":
                    type=0;
                    break;
                case "article":
                    type=1;
                    break;
                case "post":
                    type=2;
                    break;
                default:
                    type=1;
                    break;
            }
            let response = await starContent(type,this.msg.id,folderId);
            this.setLoading(getCancelLoadMsg());
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
        close(){
            this.$emit('close');
        }
    },
    async mounted() {
        this.setLoading(getLoadMsg('正在获取收藏夹信息...'));
        let response = await getStarFolders();
        this.setLoading(getCancelLoadMsg());
        if (response.status == 200) {
            for (let i = 0; i < response.folders.length; i++) {
                this.folders.push({
                    id: response.folders[i].id,
                    name: response.folders[i].name,
                    description: response.folders[i].description,
                    starNum: response.folders[i].star_count,
                    createTime: extractTime(response.folders[i].created_at),
                    items:[]
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
.row-reverse-div {
    margin-top: 5px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin-bottom: 5px;
}

.btn {
    margin-right: 20px;
}

.item-container {
    display: flex;
    flex-direction: column;
    padding: 5px;
    width: 100%;
}
.with-border{
    border-radius: 5px;
    border: 1px solid var(--theme-color);
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: center;
    width: fit-content;
}
.column-div {
    display: flex;
    flex-direction: column;
}
.icon-left-10px{
    margin-left: 10px;
}
.icon-right-5px{
    margin-right: 5px;
}
.row-60-scroll{
    max-width: 60%;
    overflow: scroll;
}
@media screen and (min-width: 600px) {
    .card {
        width: 750px;
        max-height: 800px;
        padding: 10px;
    }
    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 750px;
        overflow: auto;
    }
}

@media screen and (max-width: 600px) {
    .card {
        width: 100vw;
        max-height: 80vh;
        padding: 10px;
    }
    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 70vh;
        overflow: auto;
    }
}
</style>