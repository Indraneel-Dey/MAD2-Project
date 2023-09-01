Here are the steps to be taken to run this app.

Step-1: On a Linux terminal, move to the project directory.
Step-2: Start the Redis server with

$ sudo systemctl start redis

Step-3: Create the virtual environment with

$ sh setup.sh

Step-4: Start the Celery workers with

$ sh workers.sh

Step-5: Run the app with

$ sh run.sh

You may need to use multiple terminals.

The admin account has username `Indraneel` and password `Intj@123`. Change it in the last code block of app.py to your desired username and password.
