import { Segment, useDefault,cnPOSTag } from 'segmentit';
const segmentit = useDefault(new Segment());
const tags=["名词 名语素", "处所词", "动词 动语素", "人名", "地名", "机构团体", "其他专名","外文字符"];
/**
 * 
 * @param {String} content 
 * @returns 
 */
export function extractTags(content,num=5){
    try{
        let words=segmentit.doSegment(content).map(i => `{"word":"${i.w}","tag":"${cnPOSTag(i.p)}"}`);
        for (let i = 0; i < words.length; i++) {
            words[i] = JSON.parse(words[i]);
        }
        let result=[];
        for(let i=0;i<words.length&&i<num;i++){
            if(tags.includes(words[i].tag)){
                result.push(words[i].word);
            }
        }
        return result;
    }catch(e){
        return [];
    }
}