if [ -d "venv" ];
then
    :
else
    python3.10 -m venv venv
fi

. venv/bin/activate
pip install -r requirements.txt
deactivate