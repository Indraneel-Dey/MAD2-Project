from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, UserMixin, current_user
from flask_caching import Cache
from datetime import datetime, date, time, timedelta
import csv
from sqlalchemy_utils import database_exists, create_database
from docxtpl import DocxTemplate
from celery import Celery

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///tickets_database.sqlite3"
app.config['SECRET_KEY'] = 'OPENSESAME'
app.config['FLASK_APP'] = 'app.py'
app.config['FLASK_ENV'] = 'development'
app.config['CACHE_TYPE'] = 'redis'
app.config['CACHE_DEFAULT_TIMEOUT'] = 3600

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
cache = Cache(app)
login_manager = LoginManager(app)


def make_celery(app):
    celery = Celery(
        "app",
        backend=app.config['result_backend'],
        broker=app.config['CELERY_BROKER_URL'],
        enable_utc = False,
        timezone = "Asia/Calcutta"
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    result_backend='redis://localhost:6379'
)
celery = make_celery(app)

	
class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    tier = db.Column(db.Integer, nullable=False, default=1)

    @property
    def password(self):
        raise AttributeError('Password cannot be accessed directly.')

    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def get_id(self):
        return str(self.id)


class Theatre(db.Model):
    __tablename__ = 'theatre'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    place = db.Column(db.String, unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    customers = db.Column(db.Integer, nullable=False, default=0)
    earnings = db.Column(db.Integer, nullable=False, default=0)


class Show(db.Model):
    __tablename__ = 'show'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    rating = db.Column(db.String(5), nullable=False)
    tags = db.relationship('Tag', secondary='showtags')
    ticket_price = db.Column(db.Integer, nullable=False)
    viewers = db.Column(db.Integer, nullable=False, default=0)
    revenue = db.Column(db.Integer, nullable=False, default=0)


class Tag(db.Model):
    __tablename__ = 'tag'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class Book(db.Model):
    __tablename__ = 'book'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    show_id = db.Column(db.Integer, db.ForeignKey('show.id'), nullable=False)
    theatre_id = db.Column(db.Integer, db.ForeignKey('theatre.id'), nullable=False)
    running_id = db.Column(db.Integer, db.ForeignKey('running.id'), nullable=False)
    show_name = db.Column(db.String, nullable=False)
    theatre_name = db.Column(db.String, nullable=False)
    tickets = db.Column(db.Integer, nullable=False)
    ticket_price = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.String, nullable=False)
    end_time = db.Column(db.String, nullable=False)


class Running(db.Model):
    __tablename__ = 'running'
    id = db.Column(db.Integer, primary_key=True)
    show_id = db.Column(db.Integer, db.ForeignKey('show.id'), nullable=False)
    theatre_id = db.Column(db.Integer, db.ForeignKey('theatre.id'), nullable=False)
    show_name = db.Column(db.String, nullable=False)
    theatre_name = db.Column(db.String, nullable=False)
    start_time = db.Column(db.String, nullable=False)
    end_time = db.Column(db.String, nullable=False)
    ticket_price = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.String, nullable=False)


class Showtags(db.Model):
    __tablename__ = 'showtags'
    id = db.Column(db.Integer, primary_key=True)
    show_id = db.Column(db.Integer, db.ForeignKey('show.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)


class Message(db.Model):
    __tablename__ = 'messages'
    id = id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    contents = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)


@login_manager.user_loader
def load_user(id):
    if id is not None:
        return User.query.get(id)
    return None


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    return render_template('index.html')


@celery.task
@app.route('/api/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 409
    
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409

    user = User(username=username, email=email)
    user.password = password
    db.session.add(user)
    db.session.commit()
    cache.delete('api_users')
    login_user(user, remember=False)
    user_data = {'id': user.id, 'username': user.username, 'email': user.email, 'tier': user.tier}
    return jsonify({'success': True, 'user': user_data, 'message': 'Signup successful'}), 200


@celery.task
@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    remember = request.json.get('remember')

    user = User.query.filter_by(username=username).first()

    if user is None or not user.verify_password(password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    if remember:
        login_user(user, remember=True)
    else:
        login_user(user, remember=False)
    user_data = {'id': user.id, 'username': user.username, 'email': user.email, 'tier': user.tier}
    return jsonify({'success': True, 'user': user_data, 'message': 'Login successful'}), 200


@celery.task
@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    cache.delete('api_booked_shows')
    cache.delete('api_messages')
    return jsonify({'success': True}), 200


@celery.task
@app.route('/api/check_loggedin')
def get_user_info():
    if current_user.is_authenticated:
        user_data = {'id': current_user.id, 'username': current_user.username, 'email': current_user.email, 'tier': current_user.tier}
        return jsonify({'isLoggedIn': True, 'user': user_data}), 200
    else:
        return jsonify({'isLoggedIn': False}), 200


@celery.task
def schedule_task_1():
    for id in range(1, len(User.query.all()) + 1):
        active = False
        for book in Book.query.filter_by(user_id=id).all():
            if datetime.strptime(book.start_time, "%Y-%m-%d %H:%M").date() == date.today():
                active = True
                break
        if active:
            continue
        message = Message(
            user_id=id,
            contents="You haven't booked any tickets today. Don't miss out on watching the fantastic shows available!",
            time=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(message)
        db.session.commit()
        cache.delete('api_messages')
    return "Messages sent"


def schedule_daily_task():
    now = datetime.now()
    target_time = now.replace(hour=20, minute=0, second=0, microsecond=0)
    if now > target_time:
        target_time += timedelta(days=1)
    schedule_task_1.apply_async(eta=target_time)


@celery.task
def schedule_task_2():
    last_month_start = datetime(datetime.today().year, datetime.today().month - 1, 1)
    last_month_end = datetime(datetime.today().year, datetime.today().month, 1) - timedelta(days=1)
    for id in range(1, len(User.query.all()) + 1):
        bookings = Book.query.filter(datetime.strptime(Book.start_time, "%Y-%m-%d %H:%M").date()>=last_month_start, 
                                     datetime.strptime(Book.start_time, "%Y-%m-%d %H:%M").date()<=last_month_end, 
                                     user_id=id).all()
        shows = len(bookings)
        price = sum([book.ticket_price for book in bookings])
        message = Message(
            user_id=id,
            contents=f"You have seen {shows} shows in the last month for a total price of {price}.",
            time=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(message)
        db.session.commit()
        cache.delete('api_messages')
    return 'Messages sent'


def schedule_monthly_task():
    now = datetime.now()
    target_time = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now > target_time:
        target_time = target_time.replace(month=target_time.month + 1)
    else:
        target_time = target_time.replace(month=now.month)
    schedule_task_2.apply_async(eta=target_time)


@celery.task
@app.route('/api/messages/<int:id>')
@cache.cached(key_prefix='api_messages')
def messages(id):
    messages = Message.query.filter_by(user_id=id).all()
    if len(messages) == 0:
        return jsonify({'success': False, 'message': 'No messages'}), 200
    data = [{'id': message.id, 'time': message.time, 'contents': message.contents} for message in messages]
    return jsonify({'success': True, 'messages': data}), 200


@celery.task
@app.route('/api/messages/<int:id>', methods=['DELETE'])
def delete_message(id):
    message = Message.query.get(id)
    if not message:
        return jsonify({'suceess': False, 'message': "Message doesn't exist"}), 409
    db.session.delete(message)
    db.session.commit()
    cache.delete('api_messages')
    return ({'success': True, 'message': 'Successfully deleted'}), 200


@app.route('/api/theatres', methods=['POST'])
def create_theatre():
    name = request.json.get('name')
    place = request.json.get('place')
    capacity = int(request.json.get('capacity'))

    if Theatre.query.filter_by(name=name).first():
        return jsonify({'success': False, 'message': 'Name is already taken'}), 409
    if Theatre.query.filter_by(place=place).first():
        return jsonify({'success': False, 'message': 'A theatre already exists there'}), 409
    
    theatre = Theatre(name=name, place=place, capacity=capacity)
    db.session.add(theatre)
    db.session.commit()
    cache.delete('api_theatres')
    return jsonify({'success': True, 'id': theatre.id}), 200


@celery.task
@app.route('/api/theatres')
@cache.cached(key_prefix='api_theatres')
def theatres():
    data = Theatre.query.all()
    if len(data) == 0:
        return jsonify({'success': False, 'message': 'No theatres'}), 200
    theatres = [{'id': theatre.id, 'name': theatre.name, 'place': theatre.place, 'capacity': theatre.capacity} for theatre in data]
    return jsonify({'success': True, 'theatres': theatres}), 200


@celery.task
@app.route('/api/download_theatres')
def download_theatres():
    fields = ['Name', 'Place', 'Capacity']
    rows = [[theatre.name, theatre.place, theatre.capacity] for theatre in Theatre.query.all()]
    with open('static/theatre_data.csv', 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)
    return send_file('static/theatre_data.csv'), 200


@app.route('/api/shows', methods=['POST'])
def create_show():
    name = request.json.get('name')
    rating = request.json.get('rating')
    ticket_price = int(request.json.get('ticket_price'))
    tags = request.json.get('tags')

    if Show.query.filter_by(name=name).first():
        return jsonify({'success': False, 'message': 'Show already exists'}), 409
    
    show = Show(name=name, rating=rating, ticket_price=ticket_price)
    show.tags = Tag.query.filter(Tag.id.in_(tags)).all()
    db.session.add(show)
    db.session.commit()
    cache.delete('api_shows')
    return jsonify({'success': True, 'id': show.id}), 200


@celery.task
@app.route('/api/shows')
@cache.cached(key_prefix='api_shows')
def shows():
    data = Show.query.all()
    if len(data) == 0:
        return jsonify({'success': False, 'message': 'No shows'}), 200
    shows = [{'id': show.id, 'name': show.name, 'rating': show.rating, 'ticket_price': show.ticket_price} for show in data]
    return jsonify({'success': True, 'shows': shows}), 200


@celery.task
@app.route('/api/download_shows')
def download_shows():
    fields = ['Name', 'Rating', 'Ticket Price']
    rows = [[show.name, show.rating, show.ticket_price] for show in Show.query.all()]
    with open('static/show_data.csv', 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)
    return send_file('static/show_data.csv'), 200


@app.route('/api/tags', methods=['POST'])
def create_tags():
    name = request.json.get('name')
    
    if Tag.query.filter_by(name=name).first():
        return jsonify({'success': False, 'message': 'Tag already exists'}), 409
    
    tag = Tag(name=name)
    db.session.add(tag)
    db.session.commit()
    cache.delete('api_tags')
    return jsonify({'success': True, 'message': 'Tag successfully created'}), 200


@app.route('/api/tags')
@cache.cached(key_prefix='api_tags')
def tags():
    tags = Tag.query.all()
    if len(tags) == 0:
        return jsonify({'success': False, 'message': 'No tags'}), 200
    tags_data = [{'id': tag.id, 'name': tag.name} for tag in tags]
    return jsonify({'success': True, 'tags': tags_data}), 200


@celery.task
@app.route('/api/running/<int:id>')
def running(id):
    running = Running.query.get(id)
    if not running:
        return jsonify({'success': False, 'message': 'Show is not running'}), 404
    data = {'id': running.id, 'show_id': running.show_id, 'theatre_id': running.theatre_id, 'show_name': running.show_name, 
            'theatre_name': running.theatre_name, 'start_time': running.start_time, 'end_time': running.end_time, 
            'ticket_price': running.ticket_price, 'rating': running.rating}
    return jsonify({'success': True, 'running': data}), 200


@app.route('/api/running/<int:id>', methods=['DELETE'])
def cancel_show(id):
    running = Running.query.get(id)
    show = Show.query.get(running.show_id)
    theatre = Theatre.query.get(running.theatre_id)
    if not show:
        return jsonify({'success': False, 'message': 'Show does not exist'}), 404
    if not theatre:
        return jsonify({'success': False, 'message': 'Theatre does not exist'}), 404
    if running.start_time <= datetime.now().strftime("%Y-%m-%d %H:%M"):
        return jsonify({'success': False, 'message': 'Show has already started playing'}), 409
    for book in Book.query.filter_by(running_id=running.id).all():
        theatre.customers -= book.tickets
        show.viewers -= book.tickets
        theatre.earnings -= book.tickets * book.ticket_price
        show.revenue -= book.tickets * book.ticket_price
        message = Message(
            user_id=book.user_id,
            contents=f"Our apologies, but the show you had booked tickets for - {book.show_name} - has been cancelled. You have been refunded.",
            time= datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(message)
        cache.delete('api_messages')
        db.session.delete(book)
    db.session.delete(running)
    db.session.commit()
    cache.delete('api_booked_shows')
    return jsonify({'success': True}), 200


@celery.task
@app.route('/api/users')
@cache.cached(key_prefix='api_users')
def users():
    return jsonify({'number': len(User.query.all())}), 200


@celery.task
@app.route('/api/theatre/<int:id>')
def theatre(id):
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'success': False, 'message': 'Theatre does not exist'}), 404
    running_shows = Running.query.filter_by(theatre_id=id).all()
    shows = [{'id': running.id, 'name': running.show_name, 'start_time': running.start_time, 'end_time': running.end_time} for running in running_shows]
    theatre = {'id': id, 'name': theatre.name, 'place': theatre.place, 'capacity': theatre.capacity, 'customers': theatre.customers, 'earnings': theatre.earnings, 'shows': shows}
    return jsonify({'success': True, 'theatre': theatre}), 200


@celery.task
@app.route('/api/download_theatre/<int:id>')
def download_theatre(id):
    playing = Running.query.filter_by(theatre_id=id).all()
    theatre = Theatre.query.get(id)
    template = DocxTemplate('static/theatre/template.docx')
    context = {
        'name': theatre.name, 
        'place': theatre.place, 
        'capacity': theatre.capacity, 
        'customers': theatre.customers, 
        'earnings': theatre.earnings, 
        'running_shows': ', '.join([running.show_name for running in playing])
        }
    template.render(context)
    template.save(f'static/theatre/theatre_{id}.docx')
    return send_file(f'static/theatre/theatre_{id}.docx'), 200


@app.route('/api/theatre/<int:id>', methods=['PUT'])
def edit_theatre(id):
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'success': False, 'message': 'Theatre does not exist'}), 404
    name = request.json.get('name')
    theatre.name = name
    for running in Running.query.filter_by(theatre_id=id).all():
        running.theatre_name = name
    for book in Book.query.filter_by(theatre_id=id).all():
        book.theatre_name = name
    db.session.commit()
    cache.delete('api_theatres')
    cache.delete('api_booked_shows')
    return jsonify({'success': True, 'id': theatre.id}), 200


@app.route('/api/theatre/<int:id>', methods=['DELETE'])
def delete_theatre(id):
    theatre = Theatre.query.get(id)
    if not theatre:
        return jsonify({'success': False, 'message': 'Theatre does not exist'}), 404
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    for running in Running.query.filter_by(theatre_id=id).all():
        if running.start_time <= current_time:
            return jsonify({'success': False, 'message': 'A show is currently playing or has played already at this theatre'}), 409
    for book in Book.query.filter_by(theatre_id=id).all():
        show = Show.query.get(book.show_id)
        show.viewers -= book.tickets
        show.revenue -= book.tickets * book.ticket_price
        message = Message(
            user_id=book.user_id,
            contents=f"Our apologies, but the theatre {book.theatre_name} for a show you had booked tickets for - {book.show_name} - has been removed. You have been refunded.",
            time= datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(message)
        cache.delete('api_messages')
        db.session.delete(book)
    for running in Running.query.filter_by(theatre_id=id).all():
        db.session.delete(running)
    db.session.delete(theatre)
    db.session.commit()
    cache.delete('api_theatres')
    cache.delete('api_booked_shows')
    return jsonify({'success': True}), 200


@celery.task
@app.route('/api/show/<int:id>')
def show(id):
    show = Show.query.get(id)
    if not show:
        return jsonify({'success': False, 'message': 'Show does not exist'}), 404
    running_theatres = Running.query.filter_by(show_id=id).all()
    tags = [{'id': tag.id, 'name': tag.name} for tag in show.tags]
    theatres = [{'id': running.id, 'name': running.theatre_name, 'start_time': running.start_time, 'end_time': running.end_time} for running in running_theatres]
    show = {'id': show.id, 'name': show.name, 'rating': show.rating, 'ticket_price': show.ticket_price, 'tags': tags, 'theatres': theatres, 'viewers': show.viewers, 'revenue': show.revenue}
    return jsonify({'success': True, 'show': show}), 200


@celery.task
@app.route('/api/download_show/<int:id>')
def download_show(id):
    playing = Running.query.filter_by(show_id=id).all()
    show = Show.query.get(id)
    template = DocxTemplate('static/show/template.docx')
    context = {
        'name': show.name, 
        'rating': show.rating, 
        'ticket_price': show.ticket_price, 
        'viewers': show.viewers, 
        'revenue': show.revenue, 
        'theatres': ', '.join([running.theatre_name for running in playing]), 
        'tags': ', '.join([tag.name for tag in show.tags])
        }
    template.render(context)
    template.save(f'static/show/show_{id}.docx')
    return send_file(f'static/show/show_{id}.docx')


@app.route('/api/show/<int:id>', methods=['PUT'])
def edit_show(id):
    show = Show.query.get(id)
    if not show:
        return jsonify({'success': False, 'message': 'Show does not exist'}), 404
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    for running in Running.query.filter_by(show_id=id).all():
        if running.start_time <= current_time:
            return jsonify({'success': False, 'message': 'Show is currently playing or has played already'}), 409
    name = request.json.get('name')
    rating = request.json.get('rating')
    tags = request.json.get('tags')
    
    show.name = name
    show.rating = rating
    show.tags = Tag.query.filter(Tag.id.in_(tags)).all()
    for running in Running.query.filter_by(show_id=id).all():
        running.show_name = name
        running.rating = rating
    for book in Book.query.filter_by(show_id=id).all():
        book.show_name = name
    db.session.commit()
    cache.delete('api_shows')
    cache.delete('api_booked_shows')
    return jsonify({'success': True, 'id': show.id}), 200


@app.route('/api/show/<int:id>', methods=['DELETE'])
def delete_show(id):
    show = Show.query.get(id)
    if not show:
        return jsonify({'success': False, 'message': 'Show does not exist'}), 404
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    for running in Running.query.filter_by(show_id=id).all():
        if running.start_time <= current_time:
            return jsonify({'success': False, 'message': 'Show is currently playing or has played already'}), 409
    for book in Book.query.filter_by(show_id=id).all():
        theatre = Theatre.query.get(book.theatre_id)
        theatre.earnings -= book.tickets * book.ticket_price
        theatre.customers -= book.tickets
        message = Message(
            user_id=book.user_id,
            contents=f"Our apologies, but the show you had booked tickets for - {book.show_name} - has been removed. You have been refunded.",
            time= datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(message)
        cache.delete('api_messages')
        db.session.delete(book)
    for running in Running.query.filter_by(show_id=id).all():
        db.session.delete(running)
    db.session.delete(show)
    db.session.commit()
    cache.delete('api_shows')
    cache.delete('api_booked_shows')
    return jsonify({'success': True}), 200


@app.route('/api/tag/<int:id>')
def tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'success': False, 'message': 'Tag does not exist'}), 404
    tag_data = {'id': tag.id, 'name': tag.name}
    return jsonify({'success': True, 'tag': tag_data}), 200


@app.route('/api/tag/<int:id>', methods=['PUT'])
def edit_tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'success': False, 'message': 'Tag does not exist'}), 404
    name = request.json.get('name')
    
    tag.name = name
    db.session.commit()
    cache.delete('api_tags')
    return jsonify({'success': True}), 200


@app.route('/api/tag/<int:id>', methods=['DELETE'])
def delete_tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return jsonify({'success': False, 'message': 'Tag does not exist'}), 404
    for show in Show.query.all():
        if tag in show.tags:
            show.tags.remove(tag)
    db.session.delete(tag)
    db.session.commit()
    cache.delete('api_tags')
    return jsonify({'success': True}), 200


@app.route('/api/play_show/<int:id>', methods=['POST'])
def play_show(id):
    show = Show.query.get(id)
    if not show:
        return jsonify({'success': False, 'message': 'Show does not exist'}), 404
    theatre_id = request.json.get('theatre_id')
    date = datetime.strptime(request.json.get('date'), "%Y-%m-%d").date()
    start = time.fromisoformat(request.json.get('start_time'))
    end = time.fromisoformat(request.json.get('end_time'))
    start_time = datetime.combine(date, start).strftime("%Y-%m-%d %H:%M")
    end_time = datetime.combine(date, end).strftime("%Y-%m-%d %H:%M")
    theatre = Theatre.query.get(theatre_id)
    running = Running(show_id=id, theatre_id=theatre_id, show_name=show.name, theatre_name=theatre.name, start_time=start_time, 
                      end_time=end_time, ticket_price=show.ticket_price, rating=show.rating)
    db.session.add(running)
    db.session.commit()
    return jsonify({'success': True, 'id': id}), 200


@celery.task
@app.route('/api/current_shows')
def current_shows():
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    running_shows = Running.query.filter(Running.start_time <= current_time, Running.end_time >= current_time).all()
    if not running_shows:
        return jsonify({'success': False, 'message': 'No Currently Playing Shows'}), 200
    data = [{'id': running.id, 'show_name': running.show_name, 'theatre_name': running.theatre_name, 'ticket_price': running.ticket_price, 
             'rating': running.rating, 'start_time': running.start_time, 'end_time': running.end_time} for running in running_shows]
    return jsonify({'success': True, 'data': data}), 200


@celery.task
@app.route('/api/upcoming_shows')
def upcoming_shows():
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    upcoming_shows = Running.query.filter(Running.start_time > current_time).all()
    if not upcoming_shows:
        return jsonify({'success': False, 'message': 'No Upcoming Shows'}), 200
    data = [{'id': running.id, 'show_name': running.show_name, 'theatre_name': running.theatre_name, 'ticket_price': running.ticket_price, 
             'rating': running.rating, 'start_time': running.start_time, 'end_time': running.end_time} for running in upcoming_shows]
    return jsonify({'success': True, 'data': data}), 200


@celery.task
@app.route('/api/book_show/<int:user_id>/<int:running_id>', methods=['POST'])
def book_show(user_id, running_id):
    running = Running.query.get(running_id)
    show = Show.query.get(running.show_id)
    theatre = Theatre.query.get(running.theatre_id)
    tickets = int(request.json.get('tickets'))

    if not show or not theatre:
        return jsonify({'success': False, 'message': 'Show or Theatre does not exist'}), 404
    if running.start_time <= datetime.now().strftime("%Y-%m-%d %H:%M"):
        return jsonify({'success': False, 'message': 'Show has already started playing or ended'}), 409
    customers = 0
    for book in Book.query.filter_by(theatre_id=theatre.id).all():
        if book.end_time > running.start_time:
            customers += book.tickets
    if customers + tickets > theatre.capacity:
        return jsonify({'success': False, 'message': 'Theatre is full'}), 409
    
    booking = Book(user_id=user_id, show_id=show.id, theatre_id=theatre.id, running_id=running_id, tickets=tickets, show_name=show.name, 
                   theatre_name=theatre.name, ticket_price=show.ticket_price, start_time=running.start_time, end_time=running.end_time)
    db.session.add(booking)
    show.viewers += tickets
    show.revenue += tickets * show.ticket_price
    theatre.earnings += tickets * show.ticket_price
    show.ticket_price += show.ticket_price * tickets * 0.01
    running.ticket_price = show.ticket_price
    theatre.customers += tickets
    db.session.commit()
    cache.delete('api_booked_shows')
    return jsonify({'success': True}), 200


@celery.task
@app.route('/api/cancel_booking/<int:id>', methods=['DELETE'])
def cancel_booking(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({'success': False, 'message': 'No such booking'}), 409
    
    show = Show.query.get(book.show_id)
    theatre = Theatre.query.get(book.theatre_id)
    running = Running.query.get(book.running_id)

    if not show or not theatre or not running:
        return jsonify({'success': False, 'message': 'No such show or theatre, or show is not playing anymore'}), 404
    if running.start_time <= datetime.now().strftime("%Y-%m-%d %H:%M"):
        return jsonify({'success': False, 'message': 'Show has already started playing or ended'}), 409

    show.viewers -= book.tickets
    show.ticket_price = int(show.ticket_price / (1 + (0.01 * book.tickets)))
    running.ticket_price = show.ticket_price
    show.revenue -= book.tickets * book.ticket_price
    theatre.earnings -= book.tickets * book.ticket_price
    theatre.customers -= book.tickets
    db.session.delete(book)
    db.session.commit()
    cache.delete('api_booked_shows')
    return jsonify({'success': True}), 200


@celery.task
@app.route('/api/booked_shows/<int:id>')
@cache.cached(key_prefix='api_booked_shows')
def booked_shows(id):
    bookings = Book.query.filter_by(user_id=id).all()
    if len(bookings) == 0:
        return jsonify({'success': False, 'message': 'No booked shows'}), 200
    data = [{'id': booking.id, 'show_name': booking.show_name, 'running_id': booking.running_id, 'theatre_name': booking.theatre_name, 
             'tickets': booking.tickets, 'start_time': booking.start_time, 'end_time': booking.end_time} for booking in bookings]
    return jsonify({'success': True, 'bookings': data}), 200


@celery.task
@app.route('/api/search_theatre', methods=['POST'])
def search_theatre():
    search = request.json.get('search')
    theatres = [{'id': theatre.id, 'name': theatre.name, 'place': theatre.place, 'capacity': theatre.capacity} for theatre in Theatre.query.all() if search.lower() in theatre.name.lower()]
    if len(theatres) == 0:
        return jsonify({'success': False, 'message': 'No theatres'}), 200
    return jsonify({'success': True, 'theatres': theatres}), 200


@celery.task
@app.route('/api/search_theatre_place', methods=['POST'])
def search_theatre_place():
    search = request.json.get('search')
    theatres = [{'id': theatre.id, 'name': theatre.name, 'place': theatre.place, 'capacity': theatre.capacity} for theatre in Theatre.query.all() if search.lower() in theatre.place.lower()]
    if len(theatres) == 0:
        return jsonify({'success': False, 'message': 'No theatres'}), 200
    return jsonify({'success': True, 'theatres': theatres}), 200


@celery.task
@app.route('/api/search_show', methods=['POST'])
def search_show():
    search = request.json.get('search')
    shows = [{'id': show.id, 'name': show.name, 'rating': show.rating, 'ticket_price': show.ticket_price} for show in Show.query.all() if search.lower() in show.name.lower()]
    if len(shows) == 0:
        return jsonify({'success': False, 'message': 'No shows'}), 200
    return jsonify({'success': True, 'shows': shows}), 200


@celery.task
@app.route('/api/search_show_rating', methods=['POST'])
def search_show_rating():
    search = request.json.get('search')
    shows = [{'id': show.id, 'name': show.name, 'rating': show.rating, 'ticket_price': show.ticket_price} for show in Show.query.all() if show.rating == search]
    if len(shows) == 0:
        return jsonify({'success': False, 'message': 'No such shows'}), 200
    return jsonify({'success': True, 'shows': shows}), 200


@celery.task
@app.route('/api/search_show_tags', methods=['POST'])
def search_show_tags():
    search = request.json.get('search')
    tag = Tag.query.get(search)
    shows = [{'id': show.id, 'name': show.name, 'rating': show.rating, 'ticket_price': show.ticket_price} for show in Show.query.all() if tag in show.tags]
    if len(shows) == 0:
        return jsonify({'success': False, 'message': 'No such shows'}), 200
    return jsonify({'success': True, 'shows': shows}), 200


if __name__ == "__main__":
    with app.app_context():
        if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
            create_database(app.config["SQLALCHEMY_DATABASE_URI"])
            db.create_all()

            admin = User(username='Indraneel', email='indraneeldey1@gmail.com', tier=2)
            admin.password = 'Intj@123'
            db.session.add(admin)
            db.session.commit()
        schedule_daily_task()
        schedule_monthly_task()
    app.run(port=8000, debug=True)