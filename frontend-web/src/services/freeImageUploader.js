/**
 * Free Instant Image Uploader
 * Tự động upload hình ảnh lên dịch vụ lưu trữ đám mây & backend local storage
 * Không yêu cầu đăng ký/trả phí, hỗ trợ xem trước và gửi ảnh tức thì.
 */

export async function uploadImageFree(fileOrBlob) {
  try {
    const token = localStorage.getItem('dating_token') || localStorage.getItem('dating_callchat_token') || '';

    // 1. Try Backend Multipart Upload (Direct Local Storage)
    try {
      const backendFormData = new FormData();
      backendFormData.append('file', fileOrBlob);

      const localRes = await fetch('http://localhost:5001/api/chat/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: backendFormData
      });

      const localData = await localRes.json();
      if (localData && (localData.url || localData.mediaUrl)) {
        return { 
          success: true, 
          url: localData.url || `http://localhost:5001${localData.mediaUrl}` 
        };
      }
    } catch (e) {
      console.warn('Local backend upload attempted, trying free public cloud...', e);
    }

    // 2. Try Free ImgBB Public API endpoint
    try {
      const formData = new FormData();
      formData.append('image', fileOrBlob);
      const freeImgbbKey = '6d207e02198a847aa98d0a2a901485a5';
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${freeImgbbKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.data && data.data.url) {
        return { success: true, url: data.data.url };
      }
    } catch (e) {
      console.warn('ImgBB free upload skipped, falling back to data URL...', e);
    }

    // 3. Fallback to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ success: true, url: reader.result });
      };
      reader.readAsDataURL(fileOrBlob);
    });

  } catch (err) {
    console.error('Free upload error:', err);
    return { success: false, error: err.message };
  }
}
