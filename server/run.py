# Этот файл теперь просто точка входа.
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()