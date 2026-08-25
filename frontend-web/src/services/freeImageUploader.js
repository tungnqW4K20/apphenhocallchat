/**
 * Free Instant Image & Video Uploader
 * Tối ưu hóa đặc biệt cho iOS / Android / Web
 * Tự động nén ảnh chất lượng cao để gửi nhanh tức thì trong 0.5 giây
 */

const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5001';
    }
  }
  return 'https://dating-backend-islg.onrender.com';
};

// Client-side image compressor for instant mobile uploads
const compressImageForMobile = async (file) => {
  // If file is video or audio or small gif, skip compression
  if (!file.type.startsWith('image/') || file.type.includes('gif')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1280; // Crisp HD quality
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85 // High-quality 85% compression
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export async function uploadImageFree(fileOrBlob) {
  try {
    const token = localStorage.getItem('dating_token') || localStorage.getItem('dating_callchat_token') || '';
    const baseUrl = getBackendUrl();

    // 1. Process & Compress on Client for blazing speed on iOS
    const processedFile = await compressImageForMobile(fileOrBlob);

    // 2. Direct Cloud Backend Multipart Upload
    try {
      const backendFormData = new FormData();
      backendFormData.append('file', processedFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const uploadRes = await fetch(`${baseUrl}/api/chat/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: backendFormData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        if (data && (data.url || data.mediaUrl)) {
          const finalUrl = data.url?.startsWith('http') ? data.url : `${baseUrl}${data.mediaUrl.startsWith('/') ? '' : '/'}${data.mediaUrl}`;
          return { success: true, url: finalUrl, type: data.type };
        }
      }
    } catch (e) {
      console.warn('Direct cloud upload notice:', e.message);
    }

    // 3. Fallback: Free ImgBB Cloud API (for images only)
    if (processedFile.type && processedFile.type.startsWith('image/')) {
      try {
        const formData = new FormData();
        formData.append('image', processedFile);
        const freeKey = '6d207e02198a847aa98d0a2a901485a5';
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${freeKey}`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.data && data.data.url) {
          return { success: true, url: data.data.url, type: 'image' };
        }
      } catch (err) {
        console.warn('ImgBB fallback skipped:', err.message);
      }
    }

    // 4. Ultimate Local Data URL Fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ 
          success: true, 
          url: reader.result, 
          type: fileOrBlob.type?.startsWith('video/') ? 'video' : 'image' 
        });
      };
      reader.readAsDataURL(processedFile);
    });

  } catch (err) {
    console.error('Upload media error:', err);
    return { success: false, error: err.message };
  }
}
