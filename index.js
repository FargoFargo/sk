const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Теперь проксируем только GET запросы.
// Для GET важно сохранять query string, поэтому используем req.originalUrl.
app.get('*', async (req, res) => {
  try {
    const originalPathAndQuery = req.originalUrl; // включает путь + ?query
    const targetUrl = `https://skillcorner.com${originalPathAndQuery}`;
    
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

// Явно запрещаем POST (т.к. вы попросили заменить на GET).
app.post('*', (req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Этот сервер принимает только GET запросы'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Пример GET запроса: http://localhost:${PORT}/api/v1/endpoint`);
});
