// src/app.ts
// Получаем элементы DOM
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
const colorSwatches = document.querySelectorAll('.color-swatch') as NodeListOf<HTMLElement>;
const brushSize = document.getElementById('brushSize') as HTMLInputElement;
const brushSizeValue = document.getElementById('brushSizeValue') as HTMLSpanElement;
const newBtn = document.getElementById('newBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const gallery = document.getElementById('gallery') as HTMLDivElement;
// !!! ДОБАВЛЕНО: Кнопка "Удалить все"
const deleteAllBtn = document.getElementById('deleteAllBtn') as HTMLButtonElement; 

// Устанавливаем начальные значения
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';

// Функция для очистки холста
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Функция для рисования
function draw(e: MouseEvent) {
    if (!isDrawing) return; 
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor; 
    ctx.beginPath(); 
    ctx.moveTo(lastX, lastY); 
    ctx.lineTo(e.offsetX, e.offsetY); 
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY]; 
}

// Обработчики событий мыши
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Обработчик для кнопки "New"
newBtn.addEventListener('click', clearCanvas);

// Обработчики для палитры цветов
colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
        currentColor = (swatch as HTMLElement).dataset.color!;
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        swatch.classList.add('active');
    });
});

colorPicker.addEventListener('input', (e) => {
    currentColor = (e.target as HTMLInputElement).value;
});

// Обработчик для размера кисти
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = (e.target as HTMLInputElement).value;
});

// Функция для сохранения рисунка
async function saveDrawing() {
    const image = canvas.toDataURL('image/png');
    const response = await fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image })
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // перезагружаем галерею
}

saveBtn.addEventListener('click', saveDrawing);

// Функция для удаления одного рисунка
async function deleteDrawing(filename: string) {
    const response = await fetch(`/images/${filename}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // перезагружаем галерею
}

// !!! ДОБАВЛЕНО: Функция для удаления ВСЕХ рисунков
async function deleteAllDrawings() {
    if (!confirm("Вы уверены, что хотите удалить ВСЕ рисунки? Это действие необратимо!")) {
        return;
    }
    
    // Используем endpoint /images/all, который мы добавили на сервере
    const response = await fetch('/images/all', {
        method: 'DELETE'
    });
    
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // перезагружаем галерею
}

// !!! ДОБАВЛЕНО: Обработчик для кнопки "Удалить все"
deleteAllBtn.addEventListener('click', deleteAllDrawings);


// Функция для загрузки галереи
async function loadGallery() {
    const response = await fetch('/images');
    const images = await response.json();
    gallery.innerHTML = ''; // очищаем галерею
    images.forEach((image: string) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';

        const imgElement = document.createElement('img');
        imgElement.src = `img/${image}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteDrawing(image));

        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}

// Загружаем галерею при загрузке страницы
loadGallery();