// 工具函数：格式化文件大小显示
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const compressionControls = document.getElementById('compressionControls');
    const previewContainer = document.getElementById('previewContainer');
    const downloadArea = document.getElementById('downloadArea');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;
    let compressedDataUrl = null;

    // 拖拽上传处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#DEDEDE';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#DEDEDE';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 点击上传处理
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 质量滑块处理
    qualitySlider.addEventListener('input', (e) => {
        const quality = e.target.value;
        qualityValue.textContent = quality + '%';
        
        // 防抖处理，避免频繁压缩
        clearTimeout(qualitySlider.timeout);
        qualitySlider.timeout = setTimeout(() => {
            if (originalFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    compressImage(e.target.result, quality);
                };
                reader.readAsDataURL(originalFile);
            }
        }, 100);
    });

    // 下载按钮处理
    downloadBtn.addEventListener('click', () => {
        if (compressedDataUrl) {
            const link = document.createElement('a');
            link.download = 'compressed_' + originalFile.name;
            link.href = compressedDataUrl;
            link.click();
        }
    });

    // 处理上传的文件
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }

        originalFile = file;
        originalSize.textContent = formatFileSize(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            compressImage(e.target.result, qualitySlider.value);
        };
        reader.readAsDataURL(file);

        compressionControls.style.display = 'block';
        previewContainer.style.display = 'grid';
        downloadArea.style.display = 'block';
    }

    // 压缩图片
    function compressImage(dataUrl, quality) {
        const img = new Image();
        
        // 添加加载提示
        compressedSize.textContent = '压缩中...';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDimension = 1920; // 限制最大尺寸

            // 计算压缩后的尺寸，保持宽高比
            let width = img.width;
            let height = img.height;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round(height * maxDimension / width);
                    width = maxDimension;
                } else {
                    width = Math.round(width * maxDimension / height);
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            // 使用双线性插值算法
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // 根据原始图片类型选择压缩格式
            const mimeType = originalFile.type === 'image/png' ? 'image/jpeg' : 'image/jpeg';
            compressedDataUrl = canvas.toDataURL(mimeType, quality / 100);
            compressedPreview.src = compressedDataUrl;

            // 计算压缩后的文件大小
            const base64str = compressedDataUrl.split(',')[1];
            const compressedBytes = atob(base64str).length;
            compressedSize.textContent = formatFileSize(compressedBytes);

            // 显示压缩率
            const compressionRatio = ((1 - compressedBytes / originalFile.size) * 100).toFixed(1);
            compressedSize.textContent += ` (节省 ${compressionRatio}%)`;
        };
        img.src = dataUrl;
    }
}); 