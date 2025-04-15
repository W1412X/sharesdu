export const braille_symbols = ['⠀', '⠁', '⠂', '⠃', '⠄', '⠅', '⠆', '⠇', '⠈', '⠉', '⠊', '⠋', '⠌', '⠍', '⠎', '⠏', '⠐', '⠑', '⠒', '⠓', '⠔', '⠕', '⠖', '⠗', '⠘', '⠙', '⠚', '⠛', '⠜', '⠝', '⠞', '⠟', '⠠', '⠡', '⠢', '⠣', '⠤', '⠥', '⠦', '⠧', '⠨', '⠩', '⠪', '⠫', '⠬', '⠭', '⠮', '⠯', '⠰', '⠱', '⠲', '⠳', '⠴', '⠵', '⠶', '⠷', '⠸', '⠹', '⠺', '⠻', '⠼', '⠽', '⠾', '⠿', '⡀', '⡁', '⡂', '⡃', '⡄', '⡅', '⡆', '⡇', '⡈', '⡉', '⡊', '⡋', '⡌', '⡍', '⡎', '⡏', '⡐', '⡑', '⡒', '⡓', '⡔', '⡕', '⡖', '⡗', '⡘', '⡙', '⡚', '⡛', '⡜', '⡝', '⡞', '⡟', '⡠', '⡡', '⡢', '⡣', '⡤', '⡥', '⡦', '⡧', '⡨', '⡩', '⡪', '⡫', '⡬', '⡭', '⡮', '⡯', '⡰', '⡱', '⡲', '⡳', '⡴', '⡵', '⡶', '⡷', '⡸', '⡹', '⡺', '⡻', '⡼', '⡽', '⡾', '⡿', '⢀', '⢁', '⢂', '⢃', '⢄', '⢅', '⢆', '⢇', '⢈', '⢉', '⢊', '⢋', '⢌', '⢍', '⢎', '⢏', '⢐', '⢑', '⢒', '⢓', '⢔', '⢕', '⢖', '⢗', '⢘', '⢙', '⢚', '⢛', '⢜', '⢝', '⢞', '⢟', '⢠', '⢡', '⢢', '⢣', '⢤', '⢥', '⢦', '⢧', '⢨', '⢩', '⢪', '⢫', '⢬', '⢭', '⢮', '⢯', '⢰', '⢱', '⢲', '⢳', '⢴', '⢵', '⢶', '⢷', '⢸', '⢹', '⢺', '⢻', '⢼', '⢽', '⢾', '⢿', '⣀', '⣁', '⣂', '⣃', '⣄', '⣅', '⣆', '⣇', '⣈', '⣉', '⣊', '⣋', '⣌', '⣍', '⣎', '⣏', '⣐', '⣑', '⣒', '⣓', '⣔', '⣕', '⣖', '⣗', '⣘', '⣙', '⣚', '⣛', '⣜', '⣝', '⣞', '⣟', '⣠', '⣡', '⣢', '⣣', '⣤', '⣥', '⣦', '⣧', '⣨', '⣩', '⣪', '⣫', '⣬', '⣭', '⣮', '⣯', '⣰', '⣱', '⣲', '⣳', '⣴', '⣵', '⣶', '⣷', '⣸', '⣹', '⣺', '⣻', '⣼', '⣽', '⣾', '⣿'];
/**
 * 
 * @param {Image} blob 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} blockSize 
 * @param {Boolean} reverse 
 * @returns 
 */
export function convertToPixelatedBW(blob, width, height, blockSize, reverse = false) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (event) {
            img.src = event.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);

        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const avg = (r + g + b) / 3;
                totalBrightness += avg;
            }
            const threshold = totalBrightness / (width * height);
            for (let y = 0; y < height; y += blockSize) {
                for (let x = 0; x < width; x += blockSize) {
                    let r = 0, g = 0, b = 0;
                    let pixelCount = 0;
                    for (let dy = 0; dy < blockSize; dy++) {
                        for (let dx = 0; dx < blockSize; dx++) {
                            const pixelX = x + dx;
                            const pixelY = y + dy;

                            if (pixelX < width && pixelY < height) {
                                const index = (pixelY * width + pixelX) * 4;
                                r += data[index];
                                g += data[index + 1];
                                b += data[index + 2];
                                pixelCount++;
                            }
                        }
                    }
                    r = Math.floor(r / pixelCount);
                    g = Math.floor(g / pixelCount);
                    b = Math.floor(b / pixelCount);
                    const avg = (r + g + b) / 3;
                    let gray = 0;
                    if (reverse) {
                        gray = avg <= threshold ? 255 : 0;
                    } else {
                        gray = avg >= threshold ? 255 : 0;
                    }
                    for (let dy = 0; dy < blockSize; dy++) {
                        for (let dx = 0; dx < blockSize; dx++) {
                            const pixelX = x + dx;
                            const pixelY = y + dy;

                            if (pixelX < width && pixelY < height) {
                                const index = (pixelY * width + pixelX) * 4;
                                data[index] = gray;
                                data[index + 1] = gray;
                                data[index + 2] = gray;
                            }
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob(function (newBlob) {
                resolve(newBlob);
            }, 'image/png');
        };

        img.onerror = reject;
    });
}

/**
 * 
 * @param {Image} blob 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} blockSize 
 * @returns 
 */
export function convertToPixelatedColor(blob, width, height, blockSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (event) {
            img.src = event.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);

        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            for (let y = 0; y < height; y += blockSize) {
                for (let x = 0; x < width; x += blockSize) {
                    const colorMap = {};
                    for (let dy = 0; dy < blockSize; dy++) {
                        for (let dx = 0; dx < blockSize; dx++) {
                            const pixelX = x + dx;
                            const pixelY = y + dy;
                            if (pixelX < width && pixelY < height) {
                                const index = (pixelY * width + pixelX) * 4;
                                const r = data[index];
                                const g = data[index + 1];
                                const b = data[index + 2];
                                const a = data[index + 3];
                                const colorKey = `${r},${g},${b},${a}`;
                                if (!colorMap[colorKey]) {
                                    colorMap[colorKey] = { count: 0, color: [r, g, b, a] };
                                }
                                colorMap[colorKey].count++;
                            }
                        }
                    }
                    let maxCount = 0;
                    let dominantColor = null;
                    for (const key in colorMap) {
                        if (colorMap[key].count > maxCount) {
                            maxCount = colorMap[key].count;
                            dominantColor = colorMap[key].color;
                        }
                    }
                    if (dominantColor) {
                        for (let dy = 0; dy < blockSize; dy++) {
                            for (let dx = 0; dx < blockSize; dx++) {
                                const pixelX = x + dx;
                                const pixelY = y + dy;

                                if (pixelX < width && pixelY < height) {
                                    const index = (pixelY * width + pixelX) * 4;
                                    data[index] = dominantColor[0];
                                    data[index + 1] = dominantColor[1];
                                    data[index + 2] = dominantColor[2];
                                    data[index + 3] = dominantColor[3];
                                }
                            }
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob(function (newBlob) {
                resolve(newBlob);
            }, 'image/png');
        };

        img.onerror = reject;
    });
}

/**
 * 
 * @param {Char} char 
 * @param {Number} width 
 * @param {Number} height 
 * @returns 
 */
export async function charToImage(char, width = 26, height = 44) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        const fontSize = Math.min(width, height);
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(char, width / 2, height / 2);
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to create blob'));
            }
        }, 'image/jpeg');
    });
}

export async function getImageDimensions(blob) {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    return new Promise((resolve, reject) => {
        img.onload = () => {
            resolve([img.width, img.height]);
        };
        img.onerror = reject;
    });
}


export async function blobToRgbList(blob) {
    function loadImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function getRgbListFromCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const rgbList = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            rgbList.push([r, g, b]);
        }

        return rgbList;
    }

    try {
        const image = await loadImageFromBlob(blob);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const rgbList = getRgbListFromCanvas(canvas);
        return rgbList;
    } catch (error) {
        console.error('Error converting blob to RGB list:', error);
        throw new Error('Failed to convert blob to RGB list.');
    }
}

/**
 * 
 * @param {Image} blob 
 * @param {Number} r 
 * @param {Number} c 
 * @returns 
 */

export async function splitImageBlob(blob, r, c) {
    function loadImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    function canvasToBlob(canvas) {
        //eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    try {
        const image = await loadImageFromBlob(blob);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        const smallWidth = image.width / c;
        const smallHeight = image.height / r;
        const blobs = [];
        for (let row = 0; row < r; row++) {
            for (let col = 0; col < c; col++) {
                const smallCanvas = document.createElement('canvas');
                const smallCtx = smallCanvas.getContext('2d');
                smallCanvas.width = smallWidth;
                smallCanvas.height = smallHeight;
                smallCtx.drawImage(
                    canvas,
                    col * smallWidth, row * smallHeight, smallWidth, smallHeight,
                    0, 0, smallWidth, smallHeight
                );
                const smallBlob = await canvasToBlob(smallCanvas);
                blobs.push(smallBlob);
            }
        }

        return blobs;
    } catch (error) {
        console.error('Error splitting image:', error);
        throw new Error('Failed to split image.');
    }
}


/**
 * 
 * @param {Image} blob 
 * @param {Number} width 
 * @param {Number} height 
 * @returns 
 */
export async function resizeImageBlob(blob, width, height) {
    function loadImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function resizeImage(image, targetWidth, targetHeight) {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        return canvas;
    }

    function canvasToBlob(canvas) {
        //eslint-disable-next-line
        return new Promise((resolve, reject) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    try {
        const image = await loadImageFromBlob(blob);
        const resizedCanvas = resizeImage(image, width, height);
        const resizedBlob = await canvasToBlob(resizedCanvas);
        resizedCanvas.remove();
        image.remove();

        return resizedBlob;
    } catch (error) {
        throw new Error('Failed to resize image.');
    }
}

export function compareRGB(data1, data2) {
    try {
        if (data1.length !== data2.length) {
            throw new Error('ImageData lengths do not match');
        }
        let diffCount = 0;
        for (let i = 0; i < data1.length; i++) {
            if (data1[i][0] != data2[i][0] || data1[i][1] != data2[i][1] || data1[i][2] != data2[i][2]) {
                diffCount++;
            }
        }
        return 1 - (diffCount / (data1.length));
    } catch (e) {
        return 0;
    }
}


export async function convertImageToText(blob, rows, cols) {
    let blobs = await splitImageBlob(blob, rows, cols);
    let splitedBlobRGBList = [];
    for (let i = 0; i < blobs.length; i++) {
        let tmp = await resizeImageBlob(blobs[i], 26, 44)
        tmp = await blobToRgbList(tmp);
        splitedBlobRGBList.push(tmp);
    }
    let charBlobs = [];
    for (let i = 0; i < braille_symbols.length; i++) {
        charBlobs.push(await charToImage(braille_symbols[i]));
    }
    let charBlobRGBList = [];
    for (let i = 0; i < charBlobs.length; i++) {
        charBlobRGBList.push(await blobToRgbList(charBlobs[i]));
    }
    let resultIds = [];
    for (let i = 0; i < splitedBlobRGBList.length; i++) {
        let mostFitId = -1;
        let maxScore = -1;
        for (let u = 0; u < braille_symbols.length; u++) {
            let score = compareRGB(splitedBlobRGBList[i], charBlobRGBList[u]);
            if (score > maxScore) {
                maxScore = score;
                mostFitId = u;
            } else {
                continue;
            }
        }
        resultIds.push(mostFitId);
    }
    let result = "";
    for (let i = 0; i < rows; i++) {
        for (let u = 0; u < cols; u++) {
            result += braille_symbols[resultIds[i * cols + u]];
        }
        result += "\n";
    }
    return result;
}

/**
 * 
 * @param {Image} blob 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Boolean} reverse
 * @param {Number} linewidth 
 * @returns 
 */
export async function imageToSketch(blob, width, height, reverse=false, linewidth=1) {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await new Promise(resolve => img.onload = resolve);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const outputImageData = ctx.createImageData(width, height);
    const outputData = outputImageData.data;
    const threshold = 128;
    const edgeMap = Array.from({ length: height }, () => Array(width).fill(false));

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0;
            let gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const pixelValue = data[pixelIndex];

                    gx += pixelValue * sobelX[ky + 1][kx + 1];
                    gy += pixelValue * sobelY[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            if (magnitude > threshold) {
                edgeMap[y][x] = true;
            }
        }
    }
    const dilatedEdgeMap = Array.from({ length: height }, () => Array(width).fill(false));
    const kernelSize = 2 * linewidth + 1;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const ny = y + ky;
                    const nx = x + kx;
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width && edgeMap[ny][nx]) {
                        dilatedEdgeMap[y][x] = true;
                        break;
                    }
                }
                if (dilatedEdgeMap[y][x]) break;
            }
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            if (dilatedEdgeMap[y][x]) {
                if (reverse) {
                    outputData[index] = 255;
                    outputData[index + 1] = 255;
                    outputData[index + 2] = 255;
                } else {
                    outputData[index] = 0;
                    outputData[index + 1] = 0;
                    outputData[index + 2] = 0;
                }
            } else {
                if (reverse) {
                    outputData[index] = 0;
                    outputData[index + 1] = 0;
                    outputData[index + 2] = 0;
                } else {
                    outputData[index] = 255;
                    outputData[index + 1] = 255;
                    outputData[index + 2] = 255;
                }
            }
            outputData[index + 3] = 255;
        }
    }
    ctx.putImageData(outputImageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve));
}