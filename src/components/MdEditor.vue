<template>
    <div style="border: 1px solid #ccc">
        <MdEditor v-model="data.content" @onUploadImg="handleUploadImage"/>
    </div>
</template>
<script setup>
import { uploadArticleImage } from '@/axios/image';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
</script>
<script>
export default {
    name: 'MdEditor',
    props: {
        initData:{
            type:Object,
            default: () => {
                return {
                    content:'',
                }
            }
        }
    },
    setup() {
    },
    data() {
        /**
         * used to the map the local url to the server url
         */
        var imageDict={};
        return {
            data:null,
            imageDict,
        }
    },
    methods: {
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        handleUploadImage(files, callback) {
            const image = files[0];
            const tmpUrl=URL.createObjectURL(image);
            callback([tmpUrl]);
            //add the tmp Url to the dict 
            this.imageDict[tmpUrl]=image;
        },
        //call by the editor
        async doUpload(){
            let uploadState=true;
            let oriLocalUrls=JSON.parse(JSON.stringify(Object.keys(this.imageDict)));
            let validLocalUrls=[];
            for(let i=0;i<oriLocalUrls.length;i++){
                if(oriLocalUrls[i] in this.data.content){
                    validLocalUrls.push(oriLocalUrls[i]);
                }
            }
            this.setLoading(getLoadMsg("正在上传图片 0/"+String(validLocalUrls.length)));
            for(let i=0;i<validLocalUrls.length;i++){
                this.setLoading(getLoadMsg("正在上传图片 "+(i+1)+"/"+String(validLocalUrls.length)));
                let response=await uploadArticleImage(this.imageDict[validLocalUrls[i]]);
                if(response.status==200||response.status==201){
                    this.data.content=this.data.content.replaceAll(validLocalUrls[i],response.image_url);
                }else{
                    uploadState=false;
                }
            }
            this.setLoading(getCancelLoadMsg());
            if(uploadState){
                try{
                    //clear the img  
                    for(let i=0;i<oriLocalUrls.length;i++){
                        URL.revokeObjectURL(oriLocalUrls[i]);
                    }
                }catch(e){
                }
                return {
                    status:200,
                    message:"所有图片上传成功"
                }
            }else{
                return {
                    status:-1,
                    message:"图片上传失败"
                }
            }
        }
    },
    created() {
        this.data=this.initData;
    },
    mounted() {
    }
};
</script>
<style scoped>
@media screen and (min-width: 600px) {
    .editor{
        width:980px;
        min-height: 800px;
    }
}

@media screen and (max-width: 600px) {
    .editor{
        width:100%;
        min-height: 60%;
    }
}
</style>