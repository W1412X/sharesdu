// global image cacher
class ImageCacher {
    constructor(maxNum) {
        this.imgDict = {};
        this.maxNum = maxNum; 
        this.nowNum = 0; 
    }
    addImage(imgKey, img) {
        if (this.nowNum >= this.maxNum) {
            this._removeLeastRecentlyUsedImage();
        }
        this.imgDict[imgKey] = {
            img: img,
            time: Date.now()
        };
        this.nowNum++;
    }
    getImage(imgKey) {
        // eslint-disable-next-line
        if (this.imgDict.hasOwnProperty(imgKey)) {
            this.imgDict[imgKey].time = Date.now();
            return this.imgDict[imgKey].img;
        }
        return null;
    }

    _removeLeastRecentlyUsedImage() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (let key in this.imgDict) {
            if (this.imgDict[key].time < oldestTime) {
                oldestTime = this.imgDict[key].time;
                oldestKey = key;
            }
        }
        if (oldestKey !== null) {
            delete this.imgDict[oldestKey];
            this.nowNum--;
        }
    }
}

export var globalProfileCacher=new ImageCacher(3000);
export var globalImageCacher=new ImageCacher(100);