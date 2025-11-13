import click
from flask.cli import with_appcontext
from .models import User
from .extensions import db

def register_cli_commands(app):
    @app.cli.command("set-role")
    @click.argument("email")
    @click.argument("role")
    @with_appcontext
    def set_role(email, role):
        user = User.query.filter_by(email=email).first()
        if user:
            user.role = role
            db.session.commit()
            print(f"Роль для пользователя {email} успешно изменена на '{role}'.")
        else:
            print(f"Пользователь с email {email} не найден.")