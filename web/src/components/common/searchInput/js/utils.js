import { selfDefineLocalStorage } from "@/utils/localStorage";

export function addToSearchHistory(text){
    let items=selfDefineLocalStorage.getItem('searchHistory');
    if(items){
        items=JSON.parse(selfDefineLocalStorage.getItem('searchHistory'));
        let result=[text];
        for(let i=0;i<items.length&&i<15;i++){
            if(items[i]!=text){
                result.push(items[i]);
            }
        }
        selfDefineLocalStorage.setItem('searchHistory',JSON.stringify(result));
    }else{
        selfDefineLocalStorage.setItem('searchHistory',JSON.stringify([]));
    }
}
export function getSearchHistory(){
    let items=selfDefineLocalStorage.getItem('searchHistory');
    if(items){
        return JSON.parse(items);
    }else{
        return [];
    }
}
export function deleteSearchHistory(text=null){
    if(text==null){
        selfDefineLocalStorage.removeItem('searchHistory');
    }else{
        let items=selfDefineLocalStorage.getItem('searchHistory');
        if(items){
            items=JSON.parse(selfDefineLocalStorage.getItem('searchHistory'));
            let result=[];
            for(let i=0;i<items.length;i++){
                if(items[i]!=text){
                    result.push(items[i]);
                }
            }
            selfDefineLocalStorage.setItem('searchHistory',JSON.stringify(result));
        }else{
            selfDefineLocalStorage.setItem('searchHistory',JSON.stringify([]));
        }
    }
}
/**
 * 获取火焰随热度的颜色
 * @param {int} hotScore 
 * @returns 
 */
export function getFireColor(hotScore) {
    if (!hotScore || hotScore <= 0) {
        return "rgb(138, 138, 138)"; // 热度为0或无效时返回灰色 (#8a8a8a)
    }

    // 灰色的RGB值
    const grayRed = 138;
    const grayGreen = 138;
    const grayBlue = 138;

    // 深红色 (#ff3848) 的RGB值
    const redEnd = 255;
    const greenEnd = 56;
    const blueEnd = 72;

    // 淡红色 RGB（在渐变的中间阶段，接近 #ff8080）
    const redMid = 255;
    const greenMid = 128;
    const blueMid = 128;

    // 计算不同阶段的颜色
    let red, green, blue;

    if (hotScore <= 500) {  // 热度较低，颜色接近灰色
        red = Math.min(grayRed + (redMid - grayRed) * hotScore / 500, redMid);
        green = Math.min(grayGreen + (greenMid - grayGreen) * hotScore / 500, greenMid);
        blue = Math.min(grayBlue + (blueMid - grayBlue) * hotScore / 500, blueMid);
    } else {  // 热度较高，颜色接近深红色
        red = Math.min(redMid + (redEnd - redMid) * (hotScore - 500) / 500, redEnd);
        green = Math.min(greenMid + (greenEnd - greenMid) * (hotScore - 500) / 500, greenEnd);
        blue = Math.min(blueMid + (blueEnd - blueMid) * (hotScore - 500) / 500, blueEnd);
    }

    return `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
}


