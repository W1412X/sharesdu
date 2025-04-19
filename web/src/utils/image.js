import { globalProperties } from "@/main";

export function compressImage(blob, maxSizeKB) {
  return new Promise((resolve, reject) => {
    if (maxSizeKB <= 0) {
      reject('最大尺寸应该大于0');
      return;
    }
    const initialSizeKB = blob.size / 1024;
    if (initialSizeKB <= maxSizeKB) {
      resolve(blob);
      return;
    }

    const img = new Image();
    const objectURL = URL.createObjectURL(blob);
    img.src = objectURL;

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      let quality = 0.5;
      let lastSize = initialSizeKB;
      let currentSize = lastSize;

      function compress() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((compressedBlob) => {
          currentSize = compressedBlob.size / 1024;
          if (currentSize <= maxSizeKB || Math.abs(lastSize - currentSize) < maxSizeKB / 10) {
            resolve(compressedBlob);
          } else {
            lastSize = currentSize;
            quality *= 0.5;
            if (quality < 0.05) {
              quality = 0.05; 
            }
            canvas.toBlob(compress, 'image/jpeg', quality);
          }
        }, 'image/jpeg', quality);
      }

      compress();
    };

    img.onerror = function() {
      reject('图像加载失败');
    };
  });
}



/**
 * 
 * @param {Image} blob 
 * @param {Number} width 
 * @param {Number} height 
 * @returns 
 */
export async function resizeImage(blob, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(resizedBlob => {
        resolve(resizedBlob);
      }, blob.type);
    };
    img.onerror = (error) => {
      reject(error);
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * 
 * @param {String} imgUrl 
 */
export async function fetchImgAndDeal(imgUrl,type='svg'){
  if(imgUrl==null){
    return globalProperties.$imgDict['svg']['empty'];
  }
  if(imgUrl==globalProperties.$imgDict['svg']['upload']){
    return globalProperties.$imgDict['svg']['empty'];
  }
  let response = await fetch(imgUrl);
  let resultUrl=null;
  if (!response.ok) {
    resultUrl=globalProperties.$imgDict[type]['empty'];
  }
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.startsWith('image/')) {
    //got
    let blob = await response.blob();
    resultUrl=URL.createObjectURL(blob);
  } else if (contentType && contentType.includes('application/json')) {
    const jsonData = await response.json();
    if (jsonData.status == 403) {
      if (jsonData['message'].includes('FROZEN')) {
        //ing
        resultUrl=globalProperties.$imgDict[type]['reviewing'];
      } else {
        //failed
        resultUrl = globalProperties.$imgDict[type]['unreviewed'];
      }
    } else if (jsonData.status == 404) {
      resultUrl = globalProperties.$imgDict[type]['notFound'];
    }
  } else {
    resultUrl = globalProperties.$imgDict[type]['empty'];
  }
  return resultUrl;
}