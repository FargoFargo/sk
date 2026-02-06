const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST роут для обработки запросов
app.post('*', async (req, res) => {
  try {
    // Получаем путь из оригинального запроса
    const originalPath = req.path;
    
    // Формируем новый URL с доменом skillcorner.com
    const targetUrl = `https://skillcorner.com${originalPath}`;
    
    console.log(`Проксирование запроса: ${req.method} ${targetUrl}`);
    
    // Получаем данные из тела запроса (если есть)
    const requestData = Object.keys(req.body).length > 0 ? req.body : undefined;
    
    // Делаем запрос к SkillCorner
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: requestData,
      headers: {
        ...req.headers,
        host: 'skillcorner.com',
        // Удаляем заголовки, которые могут вызвать проблемы
        'content-length': undefined,
        'connection': undefined,
      },
      // Разрешаем редиректы
      maxRedirects: 5,
      validateStatus: () => true, // Принимаем любые статусы
    });
    
    // Устанавливаем статус и заголовки ответа
    res.status(response.status);
    
    // Копируем важные заголовки из ответа
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    
    // Возвращаем данные
    res.send(response.data);
    
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error.message);
    
    // Возвращаем ошибку клиенту
    res.status(error.response?.status || 500).json({
      error: 'Ошибка при проксировании запроса',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Обработка GET запросов (опционально)
app.get('*', async (req, res) => {
  try {
    const originalPath = req.path;
    const targetUrl = `https://skillcorner.com${originalPath}`;
    
    console.log(`Проксирование GET запроса: ${targetUrl}`);
    
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      headers: {
        ...req.headers,
        host: 'skillcorner.com',
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });
    
    res.status(response.status);
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    res.send(response.data);
    
  } catch (error) {
    console.error('Ошибка при обработке GET запроса:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Ошибка при проксировании запроса',
      message: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Пример POST запроса: http://localhost:${PORT}/api/v1/endpoint`);
});
