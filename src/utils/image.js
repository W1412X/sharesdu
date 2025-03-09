/**
 * 
 * @param {File} file 
 * @param {int} size 
 * @returns 
 */
export const compressImage = async (file, size) => {
  /**
   * returns a Promise to handle asynchronous operations
   */
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const ori_width = img.width;
        const ori_height = img.height;
        /**
         * Calculate the clipping area,
         * make sure the clipping is a squareCalculate the clipping area
         */
        let crop_width = ori_width > ori_height ? (ori_width - ori_height) / 2 : 0;
        let crop_height = ori_height > ori_width ? (ori_height - ori_width) / 2 : 0;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(
          img,
          crop_width,
          crop_height,
          ori_width - crop_width * 2,
          ori_height - crop_height * 2,
          0,
          0,
          size,
          size
        );
        /**
         * Convert the canvas content to a blob and return
         */
        canvas.toBlob(function(blob) {
          if (blob) {
            console.log(blob);
            resolve(blob);
          } else {
            reject('Image compression failed');
          }
        }, 'image/jpeg', 0.7);
      };

      img.onerror = function() {
        reject('Failed to load image');
      };
    } catch (error) {
      reject('Error processing image');
    }
  });
};