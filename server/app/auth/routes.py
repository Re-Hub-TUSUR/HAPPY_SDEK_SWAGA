from flask import request, jsonify, Blueprint
from app.models import User
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify(message="Не все поля заполнены"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(message="Пользователь с таким email уже существует"), 409

    new_user = User(name=name, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message=f"Пользователь {name} успешно зарегистрирован"), 201

@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify(message="Не все поля заполнены"), 400
    
    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        user_identity = str(user.id)
        access_token = create_access_token(identity=user_identity)
        refresh_token = create_refresh_token(identity=user_identity)
        return jsonify(access_token=access_token, refresh_token=refresh_token)
    
    return jsonify(message="Неверный email или пароль"), 401

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token)