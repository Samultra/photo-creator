let image = document.getElementById("image");
let cropper = null;
let filters = {
  grayscale: 0,
  sepia: 0,
  invert: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

// События для drag-and-drop
const dropArea = document.getElementById("drop-area");
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault(); // Предотвращаем стандартное поведение
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleImageUpload({ target: { files } });
  }
});

// Загрузка изображения
document.getElementById("file-input").addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    image.src = e.target.result;
    image.style.transform = 'rotate(0deg)'; // Сбросить поворот при загрузке нового изображения
    updateImageStyle(); // Применить текущие стили к новому изображению
    initializeCropper(); // Инициализация обрезки
  };
  reader.readAsDataURL(file);
}

// Применение фильтров
function applyFilter(filter) {
  if (filter.includes('grayscale')) filters.grayscale = 1;
  if (filter.includes('sepia')) filters.sepia = 1;
  if (filter.includes('invert')) filters.invert = 1;

  updateImageStyle();
}

function resetFilters() {
  filters = {
    grayscale: 0,
    sepia: 0,
    invert: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  };
  updateImageStyle();
}

// Обновление стиля изображения
function updateImageStyle() {
  image.style.filter = `
    grayscale(${filters.grayscale}) 
    sepia(${filters.sepia}) 
    invert(${filters.invert}) 
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%)
  `;
}

// Регулировка яркости, контраста и насыщенности
document.getElementById("brightness").addEventListener("input", function () {
  filters.brightness = this.value;
  updateImageStyle();
});
document.getElementById("contrast").addEventListener("input", function () {
  filters.contrast = this.value;
  updateImageStyle();
});
document.getElementById("saturation").addEventListener("input", function () {
  filters.saturation = this.value;
  updateImageStyle();
});

// Поворот изображения
function rotateImage(degrees) {
  const currentRotation = image.style.transform.replace(/[^0-9-]/g, '');
  const newRotation = (parseInt(currentRotation) || 0) + degrees;
  image.style.transform = `rotate(${newRotation}deg)`;
}

// Отражение изображения
function flipImage(direction) {
  if (direction === 'horizontal') {
    image.style.transform = image.style.transform.includes('scaleX(-1)') ? 'scaleX(1)' : 'scaleX(-1)';
  } else if (direction === 'vertical') {
    image.style.transform = image.style.transform.includes('scaleY(-1)') ? 'scaleY(1)' : 'scaleY(-1)';
  }
}

// Инициализация обрезки
function initializeCropper() {
  if (cropper) {
    cropper.destroy(); // Уничтожаем старый cropper, если он был
  }
  cropper = new Cropper(image, {
    aspectRatio: NaN, // Разрешаем свободную обрезку
    viewMode: 1,
    autoCrop: false,
  });
}

// Обрезка изображения
document.getElementById("crop-btn").addEventListener("click", () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    image.src = croppedCanvas.toDataURL(); // Обновляем изображение после обрезки
    cropper.destroy(); // Удаляем cropper после завершения обрезки
    cropper = null; // Сбрасываем cropper
  }
});

// Сохранение отредактированного изображения
document.getElementById("save-btn").addEventListener("click", saveImage);

function saveImage() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  // Применяем стили фильтров к изображению
  ctx.filter = `
    grayscale(${filters.grayscale}) 
    sepia(${filters.sepia}) 
    invert(${filters.invert}) 
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%)
  `;

  // Применение трансформации (поворот и отражение)
  const transform = image.style.transform;
  const isFlippedX = transform.includes('scaleX(-1)');
  const isFlippedY = transform.includes('scaleY(-1)');
  const rotation = parseInt(transform.replace(/[^0-9-]/g, '')) || 0;

  // Сохранение изображения с учетом трансформации
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(isFlippedX ? -1 : 1, isFlippedY ? -1 : 1);
  ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  ctx.restore();

  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
