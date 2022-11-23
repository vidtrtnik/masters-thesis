FROM python:3.9.15

COPY ./didcomm-server/ /opt/didcomm-server
WORKDIR /opt/didcomm-server

RUN pip install -r requirements.txt 

CMD ["uvicorn", "server:app", "--port", "2222", "--host", "0.0.0.0"]
