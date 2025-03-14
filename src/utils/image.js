/**
 * 
 * @param {File} file 
 * @param {int} type  // 1: image, 2: profile
 * @returns {Promise}
 */
export const compressImage = async (file, type) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const ori_width = img.width;
        const ori_height = img.height;

        if (type === 1) {
          // Type 1: Compress image to below 4MB while maintaining the aspect ratio
          const maxSize = 4 * 1024 * 1024; // 4MB in bytes
          let quality = 0.9; // Initial compression quality

          // Loop to reduce quality until the image size is below 4MB
          const tryCompress = () => {
            canvas.width = ori_width;
            canvas.height = ori_height;
            ctx.drawImage(img, 0, 0, ori_width, ori_height);

            canvas.toBlob(
              (blob) => {
                if (blob.size > maxSize && quality > 0.1) {
                  // Reduce the quality and try again
                  quality -= 0.1;
                  tryCompress();
                } else if (blob) {
                  console.log('Compressed image to under 4MB');
                  resolve(blob);
                } else {
                  reject('Image compression failed');
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();

        } else if (type === 2) {
          // Type 2: Crop image to 64x64 pixels from the center
          const size = 64;
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

          canvas.toBlob(function (blob) {
            if (blob) {
              console.log('Profile image compressed to 64x64');
              resolve(blob);
            } else {
              reject('Image compression failed');
            }
          }, 'image/jpeg', 0.7);
        } else {
          reject('Invalid type');
        }
      };

      img.onerror = function () {
        reject('Failed to load image');
      };

    } catch (error) {
      reject('Error processing image');
    }
  });
};
