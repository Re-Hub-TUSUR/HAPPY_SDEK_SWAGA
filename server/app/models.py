from .extensions import db, bcrypt
import datetime

from .extensions import db, bcrypt
import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    last_name = db.Column(db.String(100), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    patronymic = db.Column(db.String(100), nullable=True)
    
    role = db.Column(db.String(20), nullable=False, default='user')
    avatar_url = db.Column(db.String(255), nullable=True)
    
    is_manager = db.Column(db.Boolean, default=False)
    department = db.Column(db.String(100), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    position = db.Column(db.String(100), nullable=True)
    experience = db.Column(db.String(50), nullable=True)
    age = db.Column(db.Integer, nullable=True)

    additional_info = db.Column(db.JSON, nullable=True)
    
    current_recommendation = db.Column(db.Text, nullable=True)
    recommendation_updated_at = db.Column(db.DateTime, nullable=True)
    
    points = db.Column(db.Integer, nullable=False, default=0)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=True, default='default_test_image.png')
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='specialized')
    valid_from = db.Column(db.DateTime, nullable=True)
    valid_until = db.Column(db.DateTime, nullable=True)
    questions = db.relationship('Question', backref='test', lazy=True, cascade="all, delete-orphan")
    test_results = db.relationship('TestResult', backref='test', lazy=True, cascade="all, delete-orphan")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)
    question_type = db.Column(db.String(50), nullable=False, default='scale')
    config = db.Column(db.JSON, nullable=True)
    canonical_id = db.Column(db.Integer, nullable=True)

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    scores = db.Column(db.JSON, nullable=True)
    interpretation = db.Column(db.JSON, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    answers = db.Column(db.JSON, nullable=False)
    user = db.relationship('User', backref='test_results')