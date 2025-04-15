<template>
    <div class="card">
        <div class="top-title-div">
            {{ this.ifImage?'像素化图片':'文字表情包生成' }}
        </div>
        <v-select label="风格化类型" density="compact" variant="outlined" :items="itemTypes"
            v-model="itemType"></v-select>
        <div class="col-div">
            <v-slider v-if="ifImage" 
                v-model="width" :max="oriWidth" :step="1" :min="4" :color="themeColor" style="width: 100%;"
                label="图像宽度" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="width" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-slider v-if="ifImage" 
                v-model="height" :max="oriHeight" :step="1" :min="4" :color="themeColor" label="图像高度"
                style="width: 100%;" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="height" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-slider v-if="ifImage" 
                v-model="pixelSize" :max="50" :step="1" :min="1" :color="themeColor" label="像素块大小"
                style="width: 100%;" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="pixelSize" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-slider v-if="ifText" 
                v-model="textRowNum" :max="50" :step="1" :min="1" :color="themeColor" label="行数"
                style="width: 100%;" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="textRowNum" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-slider v-if="ifText" 
                v-model="textColNum" :max="50" :step="1" :min="1" :color="themeColor" label="列数"
                style="width: 100%;" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="textColNum" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-slider v-if="ifLine" 
                v-model="lineWidth" :max="8" :step="1" :min="1" :color="themeColor" label="线条宽度"
                style="width: 100%;" hide-details>
                <template v-slot:append>
                    <v-text-field v-model="lineWidth" density="compact" style="width: 100px" type="number"
                        variant="outlined" hide-details></v-text-field>
                </template>
            </v-slider>
            <v-btn @click="convert" variant="outlined" :color="themeColor" width="100%"
                :loading="loading"
                style="margin: 10px;font-weight: bold;">转换</v-btn>
        </div>
        <div class="row-div">
            <div class="col-div">
                <v-btn variant="text" @click="selectImage">上传原图像</v-btn>
                <img-card :width="200" :src="oriImageUrl"></img-card>
            </div>
            <div v-if="ifImage"  class="col-div">
                <div class="medium-text-div">
                    转换后图像
                </div>
                <img-card v-if="styleImageUrl != null" :width="200" :src="styleImageUrl"></img-card>
            </div>
        </div>
        <div class='text-img-container'>
            <div v-if="ifText" class="text-display">
                {{ this.imgText }}
            </div>
        </div>
        <v-btn v-if="imgText||styleImageUrl" @click="submit" variant="outlined" :color="themeColor" width="100%" style="margin: 10px;font-weight: bold;" prepend-icon="">确认编辑</v-btn>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import ImgCard from './ImgCard.vue';
import { convertImageToText, convertToPixelatedBW, convertToPixelatedColor, imageToSketch } from '@/utils/pixel_emoji.js';
import { computed, ref } from 'vue';

export default {
    setup() {
        const themeColor = globalProperties.$themeColor;
        const loading=ref(false);
        const setLoadingState=(state)=>{
            loading.value=state;
        }
        return {
            loading,
            themeColor,
            setLoadingState,
        }
    },
    components: {
        ImgCard,
    },
    props:{
        initItemTypes:{
            type: Array,
            default: ()=>{
                return ['黑白', '彩色','黑白(反转)','线条','线条(反转)','文本(线条)','文本(线条反转)','文本','文本(反转)'];
            }
        },
        initItemType:{
            type: String,
            default: '黑白'
        },
        initImageBlob:{
            type: Blob,
            default: null
        },
    },
    data() {
        const ifImage=computed(()=>{
            if(['黑白', '彩色','黑白(反转)','线条','线条(反转)'].includes(this.itemType)){
                return true;
            }else{
                return false;
            }
        })
        const ifText=computed(()=>{
            if(['文本(线条)','文本(线条反转)','文本','文本(反转)'].includes(this.itemType)){
                return true;
            }else{
                return false;
            }
        })
        const ifLine=computed(()=>{
            if(['线条','线条(反转)','文本(线条)','文本(线条反转)'].includes(this.itemType)){
                return true;
            }else{
                return false;
            }
        })
        let oriImage;
        let oriImageUrl;
        if(this.initImageBlob!=null){
            oriImage=this.initImageBlob;
            oriImageUrl=URL.createObjectURL(oriImage);
        }
        return {
            oriImage,
            oriImageUrl,
            itemType: this.initItemType,
            styleImageUrl: null,
            styleImage: null,
            width: 64,
            height: 64,
            pixelSize: 5,
            oriHeight: 64,
            imgText:null,
            oriWidth: 64,
            textColNum:32,
            textRowNum:18,
            ifText,
            ifImage,
            lineWidth:2,
            ifLine,
            itemTypes: this.initItemTypes,
        }
    },
    methods: {
        selectImage() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png, image/jpeg, image/jpg';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                    if (validTypes.includes(file.type)) {
                        const objectUrl = URL.createObjectURL(file);
                        const img = new Image();
                        img.onload = () => {
                            this.oriImage = file;
                            this.oriImageUrl = objectUrl;
                            this.oriWidth = img.width;
                            this.oriHeight = img.height;
                            this.width = img.width;
                            this.height = img.height;
                            this.styleImage = null;
                            this.styleImageUrl = null;
                        }
                        img.onerror = () => {
                            window.alert('图片加载失败，请选择其他图片');
                            URL.revokeObjectURL(objectUrl);
                        };
                        img.src = objectUrl;
                    } else {
                        window.alert('请选择正确的图片格式（PNG、JPEG、JPG）');
                    }
                }
            };

            input.click();
        },
        async convert() {
            if(this.loading){
                return;
            }
            if (this.oriImage == null || this.oriImageUrl == null) {
                window.alert('请选择原图像');
                return;
            }
            if (this.pixelSize > this.width || this.pixelSize > this.height) {
                window.alert('像素块大小不能大于图像尺寸');
                return;
            }
            let bwImg=null;
            this.setLoadingState(true);
            switch(this.itemType){
                case '黑白':
                    this.styleImage = await convertToPixelatedBW(this.oriImage, this.width, this.height, this.pixelSize);
                    this.styleImageUrl = URL.createObjectURL(this.styleImage);
                    break;
                case '黑白(反转)':
                    this.styleImage = await convertToPixelatedBW(this.oriImage, this.width, this.height, this.pixelSize, true);
                    this.styleImageUrl = URL.createObjectURL(this.styleImage);
                    break;
                case '彩色':
                   this.styleImage = await convertToPixelatedColor(this.oriImage,this.width,this.height,this.pixelSize);
                   this.styleImageUrl = URL.createObjectURL(this.styleImage);
                   break;
                case '线条':
                    this.styleImage = await imageToSketch(this.oriImage,this.width,this.height,false,this.lineWidth);
                    this.styleImage=await convertToPixelatedBW(this.styleImage,this.width,this.height,this.pixelSize);
                    this.styleImageUrl = URL.createObjectURL(this.styleImage);
                    break;
                case '线条(反转)':
                    this.styleImage = await imageToSketch(this.oriImage,this.width,this.height,true,this.lineWidth);
                    this.styleImage=await convertToPixelatedBW(this.styleImage,this.width,this.height,this.pixelSize);
                    this.styleImageUrl = URL.createObjectURL(this.styleImage);
                    break;
                case '文本':
                    bwImg=await convertToPixelatedBW(this.oriImage, this.width, this.height, 1);
                    this.imgText=await convertImageToText(bwImg,this.textRowNum,this.textColNum);
                    break;
                case '文本(反转)':
                    bwImg=await convertToPixelatedBW(this.oriImage, this.width, this.height, 1, true);
                    this.imgText=await convertImageToText(bwImg,this.textRowNum,this.textColNum);
                    break;
                case '文本(线条)':
                    bwImg=await imageToSketch(this.oriImage, this.width, this.height, false,this.lineWidth);
                    this.imgText=await convertImageToText(bwImg,this.textRowNum,this.textColNum);
                    break;
                case '文本(线条反转)':
                    bwImg=await imageToSketch(this.oriImage, this.width, this.height, true,this.lineWidth);
                    this.imgText=await convertImageToText(bwImg,this.textRowNum,this.textColNum);
                    break;
            }
            this.setLoadingState(false);
        },
        saveImage() {
            const a = document.createElement('a');
            a.href = this.styleImageUrl;
            a.download = Date.now().toString()+'.jpg';
            document.body.appendChild(a);
            a.click();
        },
        async copyText(){
            await navigator.clipboard.writeText(this.imgText)
        },
        submit(){
            if(this.ifImage){
                this.$emit('result',this.styleImage);
            }else if(this.ifText){
                this.$emit('result',this.imgText);
            }
        }
    },
    mounted() {

    }
}
</script>
<style scoped>
.top-title-div {
    font-size: 18px;
    font-weight: bold;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.medium-text-div {
    font-size: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 5px;
}
.text-display{
    margin: 5px;
    width: fit-content;
    white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
}
.text-img-container{
    display: grid;
    place-items: center;
}
.small-text-div {
    font-size: 14px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 5px;
    font-weight: bold;
    color: grey;
}

.row-div {
    display: flex;
    height: fit-content;
    flex-direction: row;
    justify-content: center;
}

.col-div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 5px;
}

@media screen and (min-width: 600px) {
    .card {
        margin: 5px;
        width: 750px;
        flex-direction: column;
        justify-content: center;
        padding: 20px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
    }
}

@media screen and (max-width: 600px) {
    .card {
        margin: 5px;
        padding: 15px;
        flex-direction: column;
        justify-content: center;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
    }
}
</style>