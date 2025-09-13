FROM python:3.11-slim

WORKDIR /app

COPY . /app/

RUN pip install --upgrade pip \
    && pip install --no-cache-dir \
       requests==2.31.0 \
       rich==13.7.1 \
       InquirerPy


VOLUME ["/app"]

ENTRYPOINT ["python", "helmsman"]
