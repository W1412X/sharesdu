package com.sharesdu.android.common.util;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import androidx.exifinterface.media.ExifInterface;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * 图片压缩工具类
 * 与web项目的imageUtils.js保持一致
 */
public class ImageUtils {
    private static final int MAX_DIMENSION = 1920; // 最大尺寸（像素）
    private static final int MAX_SIZE_KB = 4 * 1024; // 最大文件大小（KB）
    private static final float MIN_QUALITY = 0.1f;
    private static final float QUALITY_STEP = 0.1f;
    
    /**
     * 压缩图片文件
     * @param imageFile 原始图片文件
     * @param maxSizeKB 最大文件大小（KB），默认4MB
     * @return 压缩后的图片文件
     * @throws IOException 压缩失败
     */
    public static File compressImage(File imageFile, int maxSizeKB) throws IOException {
        if (imageFile == null || !imageFile.exists()) {
            throw new IOException("图片文件不存在");
        }
        
        // 读取原始图片
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(imageFile.getAbsolutePath(), options);
        
        int originalWidth = options.outWidth;
        int originalHeight = options.outHeight;
        
        // 计算缩放比例
        int scale = 1;
        if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
            int widthScale = originalWidth / MAX_DIMENSION;
            int heightScale = originalHeight / MAX_DIMENSION;
            scale = Math.max(widthScale, heightScale);
        }
        
        // 读取并缩放图片
        options.inJustDecodeBounds = false;
        options.inSampleSize = scale;
        Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath(), options);
        
        if (bitmap == null) {
            throw new IOException("无法读取图片");
        }
        
        // 处理图片旋转（根据EXIF信息）
        bitmap = rotateImageIfRequired(bitmap, imageFile);
        
        // 进一步缩放（如果需要）
        if (bitmap.getWidth() > MAX_DIMENSION || bitmap.getHeight() > MAX_DIMENSION) {
            float scaleRatio = Math.min(
                (float) MAX_DIMENSION / bitmap.getWidth(),
                (float) MAX_DIMENSION / bitmap.getHeight()
            );
            int newWidth = Math.round(bitmap.getWidth() * scaleRatio);
            int newHeight = Math.round(bitmap.getHeight() * scaleRatio);
            bitmap = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true);
        }
        
        // 压缩到指定大小
        File compressedFile = compressToFileSize(bitmap, imageFile, maxSizeKB);
        bitmap.recycle();
        
        return compressedFile;
    }
    
    /**
     * 压缩图片到指定文件大小
     */
    private static File compressToFileSize(Bitmap bitmap, File originalFile, int maxSizeKB) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        float quality = 0.9f;
        
        while (quality >= MIN_QUALITY) {
            outputStream.reset();
            bitmap.compress(Bitmap.CompressFormat.JPEG, (int) (quality * 100), outputStream);
            int sizeKB = outputStream.size() / 1024;
            
            if (sizeKB <= maxSizeKB || quality <= MIN_QUALITY) {
                break;
            }
            
            quality -= QUALITY_STEP;
        }
        
        // 创建压缩后的文件
        String compressedPath = originalFile.getParent() + File.separator + "compressed_" + originalFile.getName();
        File compressedFile = new File(compressedPath);
        
        FileOutputStream fileOutputStream = new FileOutputStream(compressedFile);
        outputStream.writeTo(fileOutputStream);
        fileOutputStream.close();
        outputStream.close();
        
        return compressedFile;
    }
    
    /**
     * 根据EXIF信息旋转图片
     */
    private static Bitmap rotateImageIfRequired(Bitmap bitmap, File imageFile) {
        try {
            ExifInterface exif = new ExifInterface(imageFile.getAbsolutePath());
            int orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            );
            
            Matrix matrix = new Matrix();
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    matrix.postRotate(90);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    matrix.postRotate(180);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    matrix.postRotate(270);
                    break;
                case ExifInterface.ORIENTATION_FLIP_HORIZONTAL:
                    matrix.postScale(-1, 1);
                    break;
                case ExifInterface.ORIENTATION_FLIP_VERTICAL:
                    matrix.postScale(1, -1);
                    break;
                default:
                    return bitmap;
            }
            
            return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
        } catch (IOException e) {
            // 如果读取EXIF失败，返回原始bitmap
            return bitmap;
        }
    }
}

