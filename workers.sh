. venv/bin/activate
export ENV=development
celery -A app.celery worker -l info
celery -A app.celery beat --max-interval 1 -l info
deactivate