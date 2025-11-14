from .extensions import db, bcrypt
import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    avatar_url = db.Column(db.String(255), nullable=True, default='default_avatar.png')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=True, default='default_test_image.png')
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)
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