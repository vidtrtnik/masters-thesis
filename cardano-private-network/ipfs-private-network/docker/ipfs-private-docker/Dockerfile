FROM ipfs/go-ipfs:master

COPY start.sh /usr/local/bin/start_ipfs
COPY webui /webui

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ipfs block stat /ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn || exit 1

RUN chown ipfs:users /usr/local/bin/start_ipfs && chmod +x /usr/local/bin/start_ipfs
