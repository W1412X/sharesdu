import { selfDefineLocalStorage } from "./localStorage";

/**
 * deal with emoji  
 */  
export async function fetchEmojis() {
    try {
        //ensure the localstorage canbe use
        if (selfDefineLocalStorage.getItem('emojis')) {
            return JSON.parse(selfDefineLocalStorage.getItem('emojis'));
        }
        const url = `/resource/emojis.json`;
        const response = await fetch(url);
        if (response.ok) {
            const emojisData = await response.json();
            try{
                selfDefineLocalStorage.setItem('emojis', JSON.stringify(emojisData));
            }catch(e){
                console.error(e);
            }
            return emojisData;
        } else {
            return {};
        }
    } catch (error) {
        console.error('Error fetching emojis:', error);
        return {}
    }
}
export function addSelfEmoji(emoji){
    let emojis=JSON.parse(selfDefineLocalStorage.getItem('emojis'));
    emojis["自定义"].unshift(emoji);
    selfDefineLocalStorage.setItem('emojis', JSON.stringify(emojis));
}
export function addUsedEmoji(emoji){
    let emojis=JSON.parse(selfDefineLocalStorage.getItem('emojis'));
    //here check if already in used 
    if(emojis["常用"].includes(emoji)){
        //move the emoji to the first
        for (let i = 0; i < emojis["常用"].length; i++) {
            if (emojis["常用"][i] == emoji) {
                emojis["常用"].splice(i, 1);
                break;
            }
        }
        emojis["常用"].unshift(emoji);
        selfDefineLocalStorage.setItem('emojis', JSON.stringify(emojis));
        return;
    }
    if(emojis["常用"].length<10){
        emojis["常用"].unshift(emoji);
    }else{
        emojis["常用"].pop();
        emojis["常用"].unshift(emoji);
    }
    selfDefineLocalStorage.setItem('emojis', JSON.stringify(emojis));
}