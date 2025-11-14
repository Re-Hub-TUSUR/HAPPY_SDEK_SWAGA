# CDEK: AI-инструмент для оценки выгорания сотрудников

Этот репозиторий содержит прототип AI-инструмента для хакатона от компании СДЭК. Приложение предназначено для ранней диагностики профессионального выгорания сотрудников, предоставления персональных рекомендаций и визуализации метрик в дашборде.

## 🤖 Технологический стек

-   **Frontend:** React, TypeScript, Axios, React Router
-   **Backend:** Python, Flask, SQLAlchemy, GigaChat API
-   **База данных:** PostgreSQL
-   **Оркестрация:** Docker, Docker Compose

---

## 🛠️ Требования для запуска

Перед началом работы убедитесь, что у вас установлены:

1.  [**Docker Desktop**](https://www.docker.com/products/docker-desktop/)
2.  [**Git**](https://git-scm.com/downloads)

---

## 🚀 Запуск проекта (в режиме разработки)

1.  **Клонируйте репозиторий:**
    ```bash
    git clone https://github.com/Breadstickhemmo/HAPPY_SDEK_SWAGA.git
    cd HAPPY_SDEK_SWAGA
    ```

2.  **Создайте файлы с переменными окружения:**

    **A) В корне проекта** создайте файл `.env` для бэкенда:
    ```env
    # Конфигурация PostgreSQL
    DB_USER=sdek_user
    DB_PASSWORD=supersecret_password_123
    DB_NAME=sdek_hackathon_db
    DB_PORT=5432

    # Секретный ключ для подписи JWT-токенов
    JWT_SECRET_KEY=your_super_secret_and_long_jwt_key_here

    # Учетные данные для GigaChat API
    GIGACHAT_CREDENTIALS=ВАШ_ДЛИННЫЙ_КЛЮЧ_ОТ_GIGACHAT_СЮДА
    ```

    **B) В папке `client`** создайте файл `.env` для фронтенда:
    ```env
    REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
    REACT_APP_SERVER_URL=http://localhost:5000
    ```
    > **Важно:** Оба файла `.env` добавлены в `.gitignore` и не должны попадать в публичный репозиторий.

3.  **Запустите все сервисы с помощью Docker Compose:**
    Эта команда скачает образы, установит зависимости и запустит контейнеры в фоновом режиме.
    ```bash
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
    ```

4.  **(Только при первом запуске)** Примените миграции базы данных:
    База данных запустилась, но она пустая. Выполните эту команду, чтобы создать все необходимые таблицы.
    ```bash
    docker-compose exec server flask db upgrade
    ```
    > Эту команду также нужно выполнять каждый раз, когда вы подтягиваете из репозитория новые изменения в структуре БД.

5.  **Готово!**
    -   **Frontend** доступен по адресу: [http://localhost:3000](http://localhost:3000)
    -   **Backend API** доступен по адресу: [http://localhost:5000](http://localhost:5000)

---

## ✨ Управление ролями

Для доступа к функциям создания и редактирования тестов, пользователю необходима роль `psychologist`.

1.  Зарегистрируйте нового пользователя через интерфейс сайта.
2.  Выполните в терминале следующую команду, заменив email на тот, который вы указали при регистрации:
    ```bash
    docker-compose exec server flask set-role your-email@example.com psychologist
    ```
3.  Перезайдите в свой аккаунт на сайте, чтобы изменения вступили в силу.

---

## ⚙️ Работа с базой данных и миграциями

Когда вы изменяете модели в `server/app/models.py` (например, добавляете новое поле), необходимо создать и применить файл миграции.

1.  **Создание новой миграции:**
    ```bash
    docker-compose exec server flask db migrate -m "Краткое описание изменений"
    ```
2.  **Применение миграции:**
    ```bash
    docker-compose exec server flask db upgrade
    ```
> **Важно:** Папка `server/migrations` **должна быть** в системе контроля версий (Git).

---

## 📋 Основные команды Docker

-   **Запустить/перезапустить все сервисы (в фоне):** `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
-   **Остановить все сервисы:** `docker-compose down`
-   **Остановить и удалить данные (полный сброс):** `docker-compose down -v`
-   **Посмотреть логи сервера:** `docker-compose logs -f server`
-   **Посмотреть логи клиента:** `docker-compose logs -f client`
-   **Выполнить команду внутри контейнера:** `docker-compose exec <имя_сервиса> <команда>`