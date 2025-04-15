import { globalProperties } from "@/main";

/**
 * 压缩图片函数
 * @param {File} file - 输入文件对象
 * @param {String} type - 处理类型 ('profile' 或 'other')
 * @returns {Promise<File>}
 */
export const compressImage = async (file, type) => {
  return new Promise((resolve, reject) => {
    try {
      if (type === 'profile') {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);
        img.src = objectURL;

        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const ori_width = img.width;
          const ori_height = img.height;
          const crop_width = ori_width > ori_height ? (ori_width - ori_height) / 2 : 0;
          const crop_height = ori_height > ori_width ? (ori_height - ori_width) / 2 : 0;

          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(
            img,
            crop_width, crop_height, ori_width - crop_width * 2, ori_height - crop_height * 2,
            0, 0, 64, 64
          );
          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(objectURL);
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: file.type });
              resolve(compressedFile); // 返回File对象
            } else {
              reject('图像压缩失败');
            }
          }, file.type.split('/')[1] || 'jpeg', 0.7);
        };

        img.onerror = function () {
          URL.revokeObjectURL(objectURL);
          reject('加载图像失败');
        };
      } else if (type === 'other') {
        // 对于其他类型的图片：如果大于4MB，则降低质量直到小于4MB
        let quality = 0.9;
        let originalFileReader = new FileReader();

        originalFileReader.readAsArrayBuffer(file);

        originalFileReader.onload = async function (event) {
          let buffer = event.target.result;
          while (buffer.byteLength >= 1 * 1024 * 1024) {
            const compressedBlob = await compressWithQuality(new Blob([buffer], { type: file.type }), quality);
            if (compressedBlob.size < 1 * 1024 * 1024) {
              const compressedFile = new File([compressedBlob], file.name, { type: file.type });
              resolve(compressedFile);
              break;
            }
            quality -= 0.1; // 减少质量设置以尝试进一步压缩
            if (quality <= 0.1) {
              reject('无法将图片压缩至4MB以下');
              break;
            }
          }
          if (buffer.byteLength < 1 * 1024 * 1024) {
            // 如果原始文件已经小于4MB，直接返回原文件
            resolve(file);
          }
        };
        originalFileReader.onerror = function () {
          reject('读取文件失败');
        };
      } else {
        reject('无效的type参数');
      }
    } catch (error) {
      reject('处理图像时出错:' + error.message);
    }
  });
};

// 辅助函数：按特定质量设置压缩图像
const compressWithQuality = (blob, quality) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectURL = URL.createObjectURL(blob);
    img.src = objectURL;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function (compressedBlob) {
        URL.revokeObjectURL(objectURL); // 清理，撤销对象URL
        if (compressedBlob) {
          resolve(compressedBlob);
        } else {
          reject('图像压缩失败');
        }
      }, blob.type, quality);
    };

    img.onerror = function () {
      URL.revokeObjectURL(objectURL); // 确保出错时清理
      reject('加载图像失败');
    };
  });
};

/**
 * 
 * @param {String} imgUrl 
 */
export async function fetchImgAndDeal(imgUrl,type='svg'){
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