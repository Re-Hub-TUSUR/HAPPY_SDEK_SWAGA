import os
from flask import Flask, jsonify
from flask_cors import CORS
import sqlalchemy

app = Flask(__name__)
CORS(app)

DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'sdek_db')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

@app.route("/api/v1/health")
def health_check():
    return jsonify(status="ok", message="Бэкенд запущен и работает!")

@app.route("/api/v1/db-test")
def db_test():
    try:
        engine = sqlalchemy.create_engine(DATABASE_URL)
        with engine.connect() as connection:
            return jsonify(status="Подключение к БД успешно!")
    except Exception as e:
        return jsonify(status=f"Ошибка подключения к БД: {str(e)}"), 500

if __name__ == '__main__':
    app.run(debug=True)