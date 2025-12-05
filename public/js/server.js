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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, '..')));
app.use(express_1.default.json({ limit: '10mb' }));
app.post('/save', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imageName = `drawing-${Date.now()}.png`;
    const imagePath = path_1.default.join(__dirname, '..', 'img', imageName);
    fs_1.default.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to save image' });
        }
        res.json({ message: 'Image saved successfully' });
    });
});
app.get('/images', (req, res) => {
    const imgDir = path_1.default.join(__dirname, '..', 'img');
    fs_1.default.readdir(imgDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to read images' });
        }
        res.json(files);
    });
});
// Удаление всех изображений — определяем этот маршрут перед параметризованным
app.delete('/images/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imgDir = path_1.default.join(__dirname, '..', 'img');
    try {
        const files = yield fs_1.default.promises.readdir(imgDir);
        const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
        if (imageFiles.length === 0) {
            return res.json({ message: 'Gallery already empty' });
        }
        for (const file of imageFiles) {
            yield fs_1.default.promises.unlink(path_1.default.join(imgDir, file));
        }
        res.json({ message: `Deleted ${imageFiles.length} images` });
    }
    catch (err) {
        console.error('Error deleting images:', err);
        res.status(500).json({ message: 'Failed to delete all images' });
    }
}));
// Удаление отдельного изображения по имени
app.delete('/images/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path_1.default.join(__dirname, '..', 'img', filename);
    fs_1.default.unlink(imagePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to delete image' });
        }
        res.json({ message: 'Image deleted successfully' });
    });
});
// Удаление всех изображений
app.delete('/images/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imgDir = path_1.default.join(__dirname, '..', 'img');
    try {
        const files = yield fs_1.default.promises.readdir(imgDir);
        const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
        if (imageFiles.length === 0) {
            return res.json({ message: 'Gallery already empty' });
        }
        for (const file of imageFiles) {
            yield fs_1.default.promises.unlink(path_1.default.join(imgDir, file));
        }
        res.json({ message: `Deleted ${imageFiles.length} images` });
    }
    catch (err) {
        console.error('Error deleting images:', err);
        res.status(500).json({ message: 'Failed to delete all images' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
