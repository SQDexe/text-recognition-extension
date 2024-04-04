document.getElementById("pasteButton").addEventListener("click", function () {

  var hiddenElement = document.getElementById("hidden1");
  hiddenElement.style.display = "block";

  readImageFromClipboard().then(blob => {
    sendImageToService(blob);
  });

  async function readImageFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (let i = 0; i < clipboardItems.length; i++) {
        const clipboardItem = clipboardItems[i];
        if (clipboardItem.types.includes("image/png")) {
          return await clipboardItem.getType("image/png");
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  function sendImageToService(blob) {
    // Преобразуем Blob в base64
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64String = reader.result.split(',')[1]; // отсекаем префикс "data:image/png;base64,"

      // Формируем объект для отправки на сервер
      const body = {
        base64Data: base64String
      };

      // Определите Content-Type в заголовке
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      // Отправляем данные в формате JSON
      fetch('http://localhost:8080/api/recognize', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          navigator.clipboard.writeText(data);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    };

    reader.readAsDataURL(blob);
  }
});
