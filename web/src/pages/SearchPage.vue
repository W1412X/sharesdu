<template>
    <div class="full-center">
        <div class="column-div">
            <div class="control-bar">
                <v-select v-model="searchType" label="搜索类型" density="compact" variant="outlined"
                    style="max-width: 100px;min-width: 100px;" :items="['全部', '文章', '帖子', '课程', '回复']"
                    :hide-details="true"></v-select>
                <v-spacer></v-spacer>
                <div id="type-container" class="type-bar">
                    <v-btn
                        variant="tonal"
                        :prepend-icon="sortIconNow"
                        :color="themeColor"
                        :slim="true"
                        >
                        {{ sortTypeLabelNow }}
                    <v-menu activator="parent">
                        <v-list style="padding-right:10px;">
                            <v-list-item v-for="(sortOption, index) in sortOptionsToShow[searchType]" :key="index"
                                :variant="sortType === sortOption.value ? 'tonal' : ''"
                                :slim="true"
                                density="compact"
                                :rounded="true"
                                :active-color="themeColor"
                                base-color="grey"
                                class="text-small sort-btn" @click="setSortType(sortOption.value)"
                                :active="sortType === sortOption.value"
                                :prepend-icon="sortOption.icon"
                                :title="sortOption.label">
                                <v-list-item-title></v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>
                </div>
            </div>
            <div class="control-bar">
                <div v-if="searchType=='课程'" class="course-select-container">
                    <v-btn variant="outlined" :color="ifCourseFilter?themeColor:'grey'" @click="()=>{ifCourseFilter=!ifCourseFilter}" prepend-icon="mdi-filter-menu-outline">筛选</v-btn>
                    <v-autocomplete v-if="ifCourseFilter" hide-details v-model="courseCollege" style="margin-left: 10px;" :min-width="'150px'"
                        :label="'开设学院'"  density="compact" :items="colleges"
                        variant="outlined"></v-autocomplete>
                    <v-select v-if="ifCourseFilter" hide-details v-model="courseType" style="margin-left: 10px;" :min-width="'100px'" :label="'课程类型'"
                        density="compact" variant="outlined"
                        :items="['全部','必修','选修','限选']"></v-select>
                    <v-select v-if="ifCourseFilter" hide-details v-model="courseMethod" style="margin-left: 10px;" :min-width="'100px'" :label="'教学类型'"
                        density="compact" variant="outlined"
                        :items="['全部','线上','线下','混合']"></v-select>
                </div>
                <div v-if="searchType=='文章'" class="course-select-container">
                    <v-btn variant="outlined" :color="ifArticleFilter?themeColor:'grey'" @click="()=>{ifArticleFilter=!ifArticleFilter}" prepend-icon="mdi-filter-menu-outline">筛选</v-btn>
                    <span></span>
                    <div v-if="ifArticleFilter" class="article-tag-container">
                        <!--delete btn-->
                        <v-btn v-for="tag in filtArticleTags" :key="tag" :color="themeColor" :text="tag" variant="tonal"
                            class="tag-btn">{{ tag }}
                            <v-spacer></v-spacer>
                            <v-btn @click="deleteTag(tag)" size="15" density="compact" variant="tonal" class="delete-tag-btn">
                                ✕
                            </v-btn>
                        </v-btn>
                        <div style="display: flex;flex-direction: row;align-items: center;">
                            <sensitive-text-field style="margin-left: 10px;margin-right: 10px;min-width: 100px;" hide-details variant="outlined" v-model="editingArticleFiltTag" density="compact" :max-width="'150px'" label="输入筛选标签"></sensitive-text-field>
                            <!--add btn-->
                            <v-btn :color="themeColor" @click="addTag" variant="tonal">
                                添加筛选标签
                            </v-btn>
                        </div>
                    </div>
                </div>
                <v-spacer v-if="searchType!='课程'&&searchType!='文章'"/>
                <div class="text-small-bold" style="color: grey;">共
                    <span :style="{color:themeColor}">{{ searchResultNum[searchType][sortType] }}</span>
                    条结果
                </div>
            </div>
            <div v-if="sortType != null" class="item-container">
                <search-item v-for="item in this.searchList[searchType][sortType]" :key="item.id" :init-data="item"
                    :need-icon="searchType == '全部'" :query="query"></search-item>
                <v-btn :loading="loading.item" :disabled="loading.item" style="width: 100%;" variant="tonal"
                    :color="themeColor" @click="load" text="加载更多"></v-btn>
            </div>
            <div v-if="searchType=='回复'" class="item-container">
                <search-item v-for="item in searchList[searchType][sortType]" :key="item.id" :init-data="item"
                    :query="query"></search-item>
                <v-btn :loading="loading.item" :disabled="loading.item" style="width: 100%;" variant="tonal"
                    :color="themeColor" @click="load" text="加载更多"></v-btn>
            </div>
            <div v-if="searchType=='全部'" class="item-container">
                <hybrid-search-item v-for="item in searchList[searchType][sortType]" :key="item.id" :init-data="item"
                    :query="query"></hybrid-search-item>
                <v-btn :loading="loading.item" :disabled="loading.item" style="width: 100%;" variant="tonal"
                    :color="themeColor" @click="load" text="加载更多"></v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalSearch, searchArticles, searchCourses, searchPosts, searchReplies } from '@/axios/search';
import HybridSearchItem from '@/components/HybridSearchItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import SensitiveTextField from '@/components/SensitiveTextField.vue';
import { globalProperties } from '@/main';
import { extractTime, getNormalErrorAlert, getNormalInfoAlert, getNormalWarnAlert, getPostWithoutLink, removeStringsInBrackets, waitSecond } from '@/utils/other';
import { computed } from 'vue';
export default {
    props: {
        type: {
            type: String,
            default: "all"
        },
        sort: {
            type: String,
            default: null,
        },
        query: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    setup() {
        let colleges=Array.from(globalProperties.$colleges);
        colleges.unshift('全部');
        return {
            themeColor: globalProperties.$themeColor,
            colleges
        }
    },
    beforeRouteLeave (to, from, next) {
        //use session storage to save memory now  
        let scanMsg={};
        scanMsg.editingArticleFiltTag=this.editingArticleFiltTag;
        scanMsg.courseCollege=this.courseCollege;
        scanMsg.courseMethod=this.courseMethod;
        scanMsg.courseType=this.courseType;
        scanMsg.searchType=this.searchType;
        scanMsg.ifCourseFilter=this.ifCourseFilter;
        scanMsg.ifArticleFilter=this.ifArticleFilter;
        scanMsg.filtArticleTags=this.filtArticleTags;
        scanMsg.sortType=this.sortType;
        scanMsg.searchList=this.searchList;
        scanMsg.searchPage=this.searchPage;
        scanMsg.searchResultNum=this.searchResultNum;
        scanMsg.loading=this.loading;
        scanMsg.articleType=this.articleType;
        scanMsg.scrollTop=document.scrollingElement.scrollTop;
        let key='searchScanMsg|'+this.query.join(',');
        sessionStorage.setItem(key,JSON.stringify(scanMsg));
        next()
    },
    components: {
        SearchItem,
        HybridSearchItem,
        SensitiveTextField,
    },
    watch: {
        courseCollege:{
            //eslint-disable-next-line
            async handler(newVal,oldVal){
                if(!this.ifMounted){
                    return;
                }
                this.searchList['课程'][this.sortType]=[];
                this.searchPage['课程'][this.sortType]=1;
                await this.load();
            },
            immediate:false,
        },
        courseMethod:{
            //eslint-disable-next-line
            async handler(newVal,oldVal){
                if(!this.ifMounted){
                    return;
                }
                this.searchList['课程'][this.sortType]=[];
                this.searchPage['课程'][this.sortType]=1;
                await this.load();
            },
            immediate:false,
        },
        courseType:{
            //eslint-disable-next-line
            async handler(newVal,oldVal){
                if(!this.ifMounted){
                    return;
                }
                this.searchList['课程'][this.sortType]=[];
                this.searchPage['课程'][this.sortType]=1;
                await this.load();
            },
            immediate:false,
        },
        searchType: {
            /** here ensure the the init sort type data has been loaded
             * then the change of sort type all comes froms the setSortType
             * so only do not listen to the sortType
             */
            //eslint-disable-next-line
            async handler(newVal, oldVal) {
                /**
                 * which fix the bug when the page first load,can not get the data 
                 */
                while(!this.ifMounted){
                    await waitSecond(0.5);
                }
                this.$emit("search_type_changed",newVal);
                //set sort type  
                if (this.searchType!="全部"&&this.searchType!="回复") {
                    this.sortType = this.sortOptionsToShow[this.searchType][0].value;
                }
                switch (newVal) {
                    case "全部":
                        this.sortType = null;
                        if(this.searchList["全部"][this.sortType].length>0){
                            return;
                        }else{
                            await this.load();
                        }
                        break;
                    case "文章":
                        if(this.searchList["文章"][this.sortType].length>0){
                            return;
                        }else{
                            await this.load();
                        }
                        break;
                    case "帖子":
                        if(this.searchList["帖子"][this.sortType].length>0){
                            return;
                        }else{
                            await this.load();
                        }
                        break;
                    case "课程":
                        if(this.searchList["课程"][this.sortType].length>0){
                            return;
                        }else{
                            await this.load();
                        }
                        break;
                    case "回复":
                        this.sortType = null;
                        if(this.searchList["回复"][this.sortType].length>0){
                            return;
                        }else{
                            await this.load();
                        }
                        break;
                    default:
                }
            },
            immediate: true,
        },
    },
    data() {
        return {
            ifMounted:false,//use to prevent the first load
            editingArticleFiltTag:"",
            courseCollege:"全部",
            courseMethod:"全部",
            courseType:"全部",
            searchType: "全部",//
            ifCourseFilter:false,
            ifArticleFilter:false,
            filtArticleTags:[],
            filtArticleTagsToSubmit:computed(()=>{
                if(this.filtArticleTags.length==0){
                    return null;
                }else{
                    return this.filtArticleTags.join(",");
                }
            }),
            sortType: null,
            sortIconNow:computed(()=>{
                return this.sortTypeIconDict[this.sortType];
            }),
            sortTypeLabelNow:computed(()=>{
                return this.sortTypeLabelDict[this.sortType];
            }),
            searchList: {
                "文章": {
                    "publish_time": [],
                    "-publish_time": [],
                    "hot_score": [],
                    "-hot_score": [],
                    "likes_count": [],
                    "-likes_count": [],
                },
                "帖子": {
                    "publish_time": [],
                    "-publish_time": [],
                    "hot_score": [],
                    "-hot_score": [],
                    "views": [],
                    "-views": []
                },
                "课程": {
                    "publish_time": [],
                    "-publish_time": [],
                    "stars": [],
                    "-stars": []
                },
                "全部": {
                    null:[]
                },
                "回复": {
                    null:[]
                }
            },
            searchPage: {
                "文章": {
                    "publish_time": 1,
                    "-publish_time": 1,
                    "hot_score": 1,
                    "-hot_score": 1,
                    "likes_count": 1,
                    "-likes_count": 1,
                },
                "帖子": {
                    "publish_time": 1,
                    "-publish_time": 1,
                    "hot_score": 1,
                    "-hot_score": 1,
                    "views": 1,
                    "-views": 1
                },
                "课程": {
                    "publish_time": 1,
                    "-publish_time": 1,
                    "stars": 1,
                    "-stars": 1
                },
                "全部": {
                    null:1
                },
                "回复": {
                    null:1
                }
            },
            searchResultNum:{
                "文章": {
                    "publish_time": 0,
                    "-publish_time": 0,
                    "hot_score": 0,
                    "-hot_score": 0,
                    "likes_count": 0,
                    "-likes_count": 0,
                },
                "帖子": {
                    "publish_time": 0,
                    "-publish_time": 0,
                    "hot_score": 0,
                    "-hot_score": 0,
                    "views": 0,
                    "-views": 0
                },
                "课程": {
                    "publish_time": 0,
                    "-publish_time": 0,
                    "stars": 0,
                    "-stars": 0
                },
                "全部": {
                    null:0
                },
                "回复": {
                    null:0
                }
            },
            loading: {
                item: false,
            },
            sortOptionsToShow: {
                '文章': [
                    {
                        value: 'publish_time',
                        label: '最近发布',
                        icon: 'mdi-sort-clock-ascending-outline',
                    },
                    {
                        value: '-publish_time',
                        label: '最早发布',
                        icon: 'mdi-sort-clock-descending-outline',
                    },
                    {
                        value: '-hot_score',
                        label: '最高热度',
                        icon: 'mdi-fire-alert',
                    },
                    { value: 'hot_score', label: '最低热度', icon: 'mdi-fire' },
                    {
                        value: '-likes_count',
                        label: '最多点赞',
                        icon: 'mdi-heart',
                    },
                    {
                        value: 'likes_count',
                        label: '最少点赞',
                        icon: 'mdi-heart-outline',
                    },
                ],
                '帖子': [
                    {
                        value: 'publish_time',
                        label: '最近发布',
                        icon: 'mdi-sort-clock-ascending-outline',
                    },
                    {
                        value: '-publish_time',
                        label: '最早发布',
                        icon: 'mdi-sort-clock-descending-outline',
                    },
                    {
                        value: '-hot_score',
                        label: '最高热度',
                        icon: 'mdi-fire-alert',
                    },
                    { value: 'hot_score', label: '最低热度', icon: 'mdi-fire' },
                    {
                        value: '-views',
                        label: '最多浏览',
                        icon: 'mdi-eye-outline',
                    },
                    { value: 'views', label: '最少浏览', icon: 'mdi-eye-off-outline' },

                ],
                '课程': [
                    {
                        value: 'publish_time',
                        label: '最近发布',
                        icon: 'mdi-sort-clock-ascending-outline',
                    },
                    {
                        value: '-publish_time',
                        label: '最早发布',
                        icon: 'mdi-sort-clock-descending-outline',
                    },
                    { value: '-stars', label: '最多收藏', icon: 'mdi-star-check-outline' },
                    {
                        value: 'stars',
                        label: '最少收藏',
                        icon: 'mdi-star-outline',
                    },
                ],
                '回复': [],
                '全部': []
            },
            sortTypeIconDict:{
                'publish_time': 'mdi-sort-clock-ascending-outline',
                '-publish_time': 'mdi-sort-clock-descending-outline',
                '-hot_score': 'mdi-fire-alert',
                'hot_score': 'mdi-fire',
                '-likes_count': 'mdi-heart',
                'likes_count': 'mdi-heart-outline',
                'views': 'mdi-eye-off-outline',
                '-views': 'mdi-eye-outline',
                '-stars': 'mdi-star-check-outline',
                'stars': 'mdi-star-outline',
                null:"mdi-circle-off-outline"
            },
            sortTypeLabelDict:{
                'publish_time': '最近发布',
                '-publish_time': '最早发布',
                '-hot_score': '最高热度',
                'hot_score': '最低热度',
                '-likes_count': '最多点赞',
                'likes_count': '最少点赞',
                'views': '最少浏览',
                '-views': '最多浏览',
                '-stars': '最多收藏',
                'stars': '最少收藏',
                null:"默认排序"
            },
            articleType: null,
            queryTosubmit: computed(() => {
                let tmp = "";
                for (let i = 0; i < this.query.length; i++) {
                    tmp += this.query[i];
                    if (i != this.query.length - 1) {
                        tmp += " ";
                    }
                }
                return tmp;
            })
        }
    },
    methods: {
        deleteTag(text) {
            var tmp=[];
            var arr=Array.from(this.filtArticleTags);
            for (let i=0;i<arr.length;i++) {
                if(arr[i]!=text){
                    tmp.push(arr[i]);
                }
            }
            this.filtArticleTags = tmp;
            this.searchList['文章'][this.sortType] = [];
            this.searchPage['文章'][this.sortType] = 1;
            this.load();
        },
        async addTag(){
            if(!this.editingArticleFiltTag){
                this.alert(getNormalInfoAlert("标签不可为空"));
                return;
            }
            if(this.filtArticleTags.includes(this.editingArticleFiltTag)){
                this.alert(getNormalInfoAlert("标签已存在"));
                return;
            }
            this.filtArticleTags.push(this.editingArticleFiltTag);
            this.searchList['文章'][this.sortType] = [];
            this.searchPage['文章'][this.sortType] = 1;
            this.load();
            this.editingArticleFiltTag="";
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        async loadArticle() {
            this.loading.item = true;
            let response = await searchArticles(this.queryTosubmit, this.filtArticleTagsToSubmit, this.articleType, this.sortType, this.searchPage['文章'][this.sortType]);
            this.loading.item = false;
            if (response.status == 200) {
                this.searchResultNum[this.searchType][this.sortType]=response.count;
                for (let i = 0; i < response.results.length; i++) {
                    this.searchList['文章'][this.sortType].push({
                        itemType: "article",
                        id: response.results[i].article_id,
                        title: response.results[i].article_title,
                        summary: response.results[i].article_summary,
                        starNum: response.results[i].star_count,
                        viewNum: response.results[i].view_count,
                        likeNum: response.results[i].likes_count,
                        publishTime: response.results[i].publish_time,
                        tags: response.results[i].article_tags,
                        authorName: response.results[i].author_name,
                        authorId: response.results[i].author_id,
                        coverLink: response.results[i].cover_link,
                        type: response.results[i].article_type,
                        hotScore: response.results[i].hot_score
                    })
                }
                this.searchPage['文章'][this.sortType]++;
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadCourse() {
            let tmpType = null;
            switch (this.courseType) {
                case "必修":
                    tmpType = "compulsory";
                    break;
                case "选修":
                    tmpType = "elective";
                    break;
                case "限选":
                    tmpType = "restricted_elective";
                    break;
                default:
                    tmpType = null;
            }
            let tmpAttendMethod = null;
            switch (this.courseMethod) {
                case "线下":
                    tmpAttendMethod = "offline";
                    break;
                case "线上":
                    tmpAttendMethod = "online";
                    break;
                case "混合":
                    tmpAttendMethod = "hybrid";
                    break;
                default:
                    tmpAttendMethod = null;
            }
            if(this.courseCollege=='全部'){
                this.courseCollege=null;
            }
            this.loading.item = true;
            let response = await searchCourses(this.queryTosubmit, tmpType, this.courseCollege,tmpAttendMethod, this.sortType, this.searchPage["课程"][this.sortType]);
            this.loading.item = false;
            if (response.status == 200) {
                this.searchResultNum[this.searchType][this.sortType]=response.count;
                for (let i = 0; i < response.results.length; i++) {
                    let tmpType="";
                    switch(response.results[i].course_type){
                        case 'compulsory':
                            tmpType='必修';
                            break;
                        case 'elective':
                            tmpType='选修';
                            break;
                        case 'restricted_elective':
                            tmpType='限选';
                            break;
                    }
                    let tmpMethod="";
                    switch(response.results[i].course_method){
                        case 'online':
                            tmpMethod='线上';
                            break;
                        case 'offline':
                            tmpMethod='线下';
                            break;
                        case 'hybrid':
                            tmpMethod='混合';
                            break;
                    }
                    this.searchList["课程"][this.sortType].push({
                        itemType:"course",
                        id: response.results[i].course_id,
                        name: response.results[i].course_name,
                        type: tmpType,
                        college: response.results[i].college,
                        credit: response.results[i].credits,
                        campus: response.results[i].campus,
                        teacher: response.results[i].teacher,
                        attendMethod: tmpMethod,
                        examineMethod: response.results[i].assessment_method,
                        score: response.results[i].score,
                        scoreSum: response.results[i].all_score,
                        evaluateNum: response.results[i].all_people,
                        publishTime: response.results[i].publish_time,
                    })
                }
                this.searchPage["课程"][this.sortType]++;
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadPost() {
            this.loading.item = true;
            let response = await searchPosts(this.queryTosubmit,this.sortType,this.searchPage['帖子'][this.sortType]);
            this.loading.item = false;
            if(response.status==200){
                this.searchResultNum[this.searchType][this.sortType]=response.count;
                for(let i=0;i<response.results.length;i++){
                    this.searchList["帖子"][this.sortType].push({
                        itemType:"post",
                        id: response.results[i].post_id,
                        title: response.results[i].post_title,
                        content: response.results[i].post_content,
                        authorId: response.results[i].poster_id,
                        authorName: response.results[i].poster_name,
                        viewNum: response.results[i].view_count,
                        likeNum: response.results[i].likes_count,
                        replyNum: response.results[i].reply_count,
                        publishTime: response.results[i].publish_time,
                        ifLike: response.results[i].if_like,
                        ifStar: response.results[i].if_star
                    })
                }
                this.searchPage["帖子"][this.sortType]++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadReply() {
            this.loading.item = true;
            let response=await searchReplies(this.queryTosubmit,this.searchPage["回复"][this.sortType]);
            this.loading.item=false;
            if(response.status==200){
                this.searchResultNum["回复"][null]=response.count;
                for(let i=0;i<response.results.length;i++){
                    this.searchList['回复'][this.sortType].push({
                        itemType:"reply",
                        id:response.results[i].reply_id,
                        content:response.results[i].reply_content,
                        postId:response.results[i].post_id,  
                        postTitle:response.results[i].post_title,
                        authorName:response.results[i].replier_name,
                        authorId:response.results[i].replier_id,
                        publishTime:extractTime(response.results[i].reply_time),
                    })
                }
                this.searchPage['回复'][this.sortType]++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadAll() {
            this.loading.item = true;
            let response=await globalSearch(this.queryTosubmit,this.searchPage["全部"][this.sortType]);
            this.loading.item = false;
            if(response.status==200||response.results){
                this.searchResultNum['全部'][null]=response.count;
                for(let i=0;i<response.results.length;i++){
                    let tmp={
                        type:response.results[i].type,
                        id:response.results[i].id
                    };
                    switch(response.results[i].type){
                        case 'article':
                            tmp['articleTitle']=response.results[i].title;
                            tmp['articleSummary']=response.results[i].summary;
                            tmp['articleAuthor']=response.results[i].author;
                            break;
                        case 'post':
                            tmp['postTitle']=response.results[i].title;
                            tmp['postContent']=removeStringsInBrackets(getPostWithoutLink(response.results[i].content));
                            tmp['postAuthor']=response.results[i].author;
                            break;
                        case 'reply':
                            tmp['replyContent']=response.results[i].content;
                            tmp['replyPostId']=response.results[i].post_id;
                            tmp['replyPostTitle']=response.results[i].post_title;
                            break;
                        case 'course':
                            tmp['courseName']=response.results[i].name;
                            tmp['courseCollege']=response.results[i].college;
                            tmp['courseTeacher']=response.results[i].teacher;
                            break;
                    }
                    this.searchList["全部"][this.sortType].push(tmp);
                }
                this.searchPage["全部"][this.sortType]++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async load() {
            switch (this.searchType) {
                case "文章":
                    await this.loadArticle();
                    break;
                case "课程":
                    await this.loadCourse();
                    break;
                case "帖子":
                    await this.loadPost();
                    break;
                case "回复":
                    await this.loadReply();
                    break;
                case "全部":
                    await this.loadAll();
                    break;
                default:
                    this.alert(getNormalWarnAlert("未知错误"));
            }
        },
        setSortType(sortValue) {
            this.sortType = sortValue;
            if(this.searchList[this.searchType][this.sortType].length>0){
                return;
            }else{
                this.load();
            }
        },
    },
    mounted() {
        //get the sessionStorage  
        document.getElementById('web-title').innerText='搜索結果';
        let sessionKey='searchScanMsg|'+this.query.join(',');
        let scanMsg=sessionStorage.getItem(sessionKey);
        if(scanMsg){
            scanMsg=JSON.parse(scanMsg);
            this.editingArticleFiltTag=scanMsg.editingArticleFiltTag;
            this.courseCollege=scanMsg.courseCollege;
            this.courseMethod=scanMsg.courseMethod;
            this.courseType=scanMsg.courseType;
            this.searchType=scanMsg.searchType;
            this.ifCourseFilter=scanMsg.ifCourseFilter;
            this.ifArticleFilter=scanMsg.ifArticleFilter;
            this.filtArticleTags=scanMsg.filtArticleTags;
            this.sortType=scanMsg.sortType;
            this.searchList=scanMsg.searchList;
            this.searchPage=scanMsg.searchPage;
            this.searchResultNum=scanMsg.searchResultNum;
            this.loading=scanMsg.loading;
            this.articleType=scanMsg.articleType;
            setTimeout(()=>{
                document.scrollingElement.scrollTop=scanMsg.scrollTop;
            },100);
            return;
        }
        if (!this.type || this.query.length > 0) {
            switch (this.type) {
                case 'article':
                    this.searchType = "文章";
                    break;
                case 'course':
                    this.searchType = "课程";
                    break;
                case 'post':
                    this.searchType = "帖子";
                    break;
                case 'reply':
                    this.searchType = "回复";
                    break;
                case 'all':
                    this.searchType = "全部";
                    break;
                default:
                    this.searchType = "全部";
            }
        } else {
            this.$router.push({
                name: "ErrorPage",
                params: {
                    reason: "缺少必要参数 >_< "
                }
            })
        }
        this.ifMounted=true;
    }
}
</script>
<style>
.sort-btn {
    margin-left: 10px;
    max-height: 25px;
}

.column-div {
    display: flex;
    flex-direction: column;
}
.tag-btn {
    min-width: 0px;
    padding-top: 0px;
    padding-right: 3px;
    padding-bottom: 1px;
    margin-bottom: 5px;
    margin-left: 3px;
    margin-right: 3px;
}
.delete-tag-btn {
    border-radius: 50px;
    height: 15px;
    margin: 5px;
    font-size: 12px;
    color: #8a8a8a;
    font-weight: 600;
    padding-top: 0px;
    margin-right: 0px;
    padding-right: 0px;
    margin-left: 10px;
}
/** desktop */
@media screen and (min-width: 1000px) {
    .full-screen {
        width: 100%;
        height: 100%;
    }
    .course-select-container{
        display: flex;
        flex-direction: row;
        overflow-x: scroll;
        padding: 6px;
        margin-right: 30px;
        max-width: none;
        flex:1;
        align-items: center;
    }
    .item-container {
        display: flex;
        width: 750px;
        flex-direction: column;
        height: fit-content;
        background-color: white;
    }

    .control-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: max-content;
        width: 750px;
        max-width: 750px;
        overflow-x: scroll;
        padding: 5px;
    }

    .type-bar {
        display: flex;
        flex-direction: row;
        height: 100%;
        align-items: center;
        max-width: 400px;
        margin-right: 10px;
        width: fit-content;
        overflow-x: scroll;
    }
    .article-tag-container{
        padding: 6px;
        margin-right: 30px;
        max-width: none;
        flex:1;
        align-items: center;
    }
}

/** mobile */
@media screen and (max-width: 1000px) {
    .full-screen {
        width: 100vw;
        height: 100vh;
    }

    .item-container {
        display: flex;
        height: fit-content;
        flex-direction: column;
        background-color: white;
    }
    .course-select-container{
        display: flex;
        flex-direction: row;
        overflow-x: scroll;
        flex:1;
        margin-right: 30px;
        max-width: none;
        align-items: center;
        padding: 6px;
    }
    .article-tag-container{
        padding: 6px;
        margin-right: 30px;
        max-width: none;
        flex:1;
        align-items: center;
    }
    .control-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: max-content;
        overflow-x: scroll;
        width: 100vw;
        padding: 5px;
    }

    .type-bar {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: fit-content;
        align-items: center;
        margin-right: 10px;
        max-width: 60vw;
        overflow-x: scroll;
    }
}
</style>