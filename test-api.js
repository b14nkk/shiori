const http = require("http");

// Функция для выполнения HTTP запросов
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null,
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Тестирование API
async function testAPI() {
  console.log("🚀 Тестирование API...\n");

  try {
    // 1. Проверить базовый endpoint
    console.log("1. Проверка базового endpoint...");
    const baseResponse = await makeRequest({
      hostname: "localhost",
      port: 3001,
      path: "/",
      method: "GET",
    });
    console.log(`Статус: ${baseResponse.status}`);
    console.log(`Ответ: ${JSON.stringify(baseResponse.data, null, 2)}\n`);

    // 2. Получить все заметки
    console.log("2. Получение всех заметок...");
    const notesResponse = await makeRequest({
      hostname: "localhost",
      port: 3001,
      path: "/api/notes",
      method: "GET",
    });
    console.log(`Статус: ${notesResponse.status}`);
    console.log(`Количество заметок: ${notesResponse.data?.length || 0}`);
    console.log(`Заметки: ${JSON.stringify(notesResponse.data, null, 2)}\n`);

    // 3. Создать новую заметку
    console.log("3. Создание новой заметки...");
    const newNote = {
      title: "Тестовая заметка",
      content: "Это тестовая заметка, созданная через API",
    };
    const createResponse = await makeRequest(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/notes",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      newNote,
    );
    console.log(`Статус: ${createResponse.status}`);
    console.log(
      `Создана заметка: ${JSON.stringify(createResponse.data, null, 2)}\n`,
    );

    const createdNoteId = createResponse.data?.id;

    if (createdNoteId) {
      // 4. Получить заметку по ID
      console.log("4. Получение заметки по ID...");
      const noteByIdResponse = await makeRequest({
        hostname: "localhost",
        port: 3001,
        path: `/api/notes/${createdNoteId}`,
        method: "GET",
      });
      console.log(`Статус: ${noteByIdResponse.status}`);
      console.log(
        `Заметка: ${JSON.stringify(noteByIdResponse.data, null, 2)}\n`,
      );

      // 5. Обновить заметку
      console.log("5. Обновление заметки...");
      const updatedNote = {
        title: "Обновленная тестовая заметка",
        content: "Это обновленная тестовая заметка",
      };
      const updateResponse = await makeRequest(
        {
          hostname: "localhost",
          port: 3001,
          path: `/api/notes/${createdNoteId}`,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
        updatedNote,
      );
      console.log(`Статус: ${updateResponse.status}`);
      console.log(
        `Обновленная заметка: ${JSON.stringify(updateResponse.data, null, 2)}\n`,
      );

      // 6. Удалить заметку
      console.log("6. Удаление заметки...");
      const deleteResponse = await makeRequest({
        hostname: "localhost",
        port: 3001,
        path: `/api/notes/${createdNoteId}`,
        method: "DELETE",
      });
      console.log(`Статус: ${deleteResponse.status}`);
      console.log(`Заметка удалена\n`);

      // 7. Проверить, что заметка удалена
      console.log("7. Проверка удаления...");
      const deletedNoteResponse = await makeRequest({
        hostname: "localhost",
        port: 3001,
        path: `/api/notes/${createdNoteId}`,
        method: "GET",
      });
      console.log(`Статус: ${deletedNoteResponse.status}`);
      console.log(
        `Ответ: ${JSON.stringify(deletedNoteResponse.data, null, 2)}\n`,
      );
    }

    // 8. Финальная проверка всех заметок
    console.log("8. Финальная проверка всех заметок...");
    const finalNotesResponse = await makeRequest({
      hostname: "localhost",
      port: 3001,
      path: "/api/notes",
      method: "GET",
    });
    console.log(`Статус: ${finalNotesResponse.status}`);
    console.log(`Количество заметок: ${finalNotesResponse.data?.length || 0}`);
    console.log(
      `Заметки: ${JSON.stringify(finalNotesResponse.data, null, 2)}\n`,
    );

    console.log("✅ Тестирование API завершено успешно!");
  } catch (error) {
    console.error("❌ Ошибка при тестировании API:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("💡 Убедитесь, что сервер запущен на порту 3001");
      console.error("   Запустите: cd backend && npm run dev");
    }
  }
}

// Запуск тестов
testAPI();
