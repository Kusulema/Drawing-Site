"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/app.ts
// Получаем элементы DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const colorSwatches = document.querySelectorAll('.color-swatch');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const newBtn = document.getElementById('newBtn');
const saveBtn = document.getElementById('saveBtn');
const gallery = document.getElementById('gallery');
// !!! ДОБАВЛЕНО: Кнопка "Удалить все"
const deleteAllBtn = document.getElementById('deleteAllBtn');
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
function draw(e) {
    if (!isDrawing)
        return;
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
        var _a;
        currentColor = swatch.dataset.color;
        (_a = document.querySelector('.color-swatch.active')) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        swatch.classList.add('active');
    });
});
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});
// Обработчик для размера кисти
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = e.target.value;
});
// Функция для сохранения рисунка
function saveDrawing() {
    return __awaiter(this, void 0, void 0, function* () {
        const image = canvas.toDataURL('image/png');
        const response = yield fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image })
        });
        const data = yield response.json();
        console.log(data.message);
        loadGallery(); // перезагружаем галерею
    });
}
saveBtn.addEventListener('click', saveDrawing);
// Функция для удаления одного рисунка
function deleteDrawing(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/images/${filename}`, {
            method: 'DELETE'
        });
        const data = yield response.json();
        console.log(data.message);
        loadGallery(); // перезагружаем галерею
    });
}
// !!! ДОБАВЛЕНО: Функция для удаления ВСЕХ рисунков
function deleteAllDrawings() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm("Вы уверены, что хотите удалить ВСЕ рисунки? Это действие необратимо!")) {
            return;
        }
        // Используем endpoint /images/all, который мы добавили на сервере
        const response = yield fetch('/images/all', {
            method: 'DELETE'
        });
        const data = yield response.json();
        console.log(data.message);
        loadGallery(); // перезагружаем галерею
    });
}
// !!! ДОБАВЛЕНО: Обработчик для кнопки "Удалить все"
deleteAllBtn.addEventListener('click', deleteAllDrawings);
// Функция для загрузки галереи
function loadGallery() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/images');
        const images = yield response.json();
        gallery.innerHTML = ''; // очищаем галерею
        images.forEach((image) => {
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
    });
}
// Загружаем галерею при загрузке страницы
loadGallery();
