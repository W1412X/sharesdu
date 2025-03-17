<template>
    <v-textarea v-model="text"></v-textarea>
    <v-btn @click="test">ssss</v-btn>
</template>
<script>
import { cnPOSTag, Segment, useDefault } from 'segmentit';
export default {
    setup() {
        const segmentit = useDefault(new Segment());
        return {
            segmentit,
        }
    },
    data() {
        return {
            text: "",
        }
    },
    methods: {
        test() {
            try {
                let tmp=this.text.replace(/[^\u4e00-\u9fa5]/g, '。');
                const words = this.segmentit.doSegment(tmp).map(i => `{"word":"${i.w}","tag":"${cnPOSTag(i.p)}"}`);

                // 解析每个词语
                for (let i = 0; i < words.length; i++) {
                    words[i] = JSON.parse(words[i]);
                }

                /**
                 * do frequency 
                 */
                let keyTags = ["名词 名语素", "处所词", "动词 动语素", "人名", "地名", "机构团体", "其他专名"];

                // 创建一个频率计数器
                let frequency = {};

                // 遍历所有词，筛选出属于keyTags的词并计算频率
                for (let i = 0; i < words.length; i++) {
                    if (keyTags.includes(words[i].tag)) {
                        const word = words[i].word;
                        if (frequency[word]) {
                            frequency[word] += 1; // 词频加1
                        } else {
                            frequency[word] = 1; // 第一次出现，设置词频为1
                        }
                    }
                }

                // 将频率数据转化为数组并排序，按频率降序排序
                let sortedWords = Object.keys(frequency).map(word => ({
                    word: word,
                    frequency: frequency[word]
                })).sort((a, b) => b.frequency - a.frequency);

                // 输出排序后的词语和频率
                for (let i = 0; i < sortedWords.length; i++) {
                    console.log(`${sortedWords[i].word}: ${sortedWords[i].frequency}`);
                }

            } catch (e) {
                console.log(e);
            }
        }
    }
}
</script>