DENO_VERSION="1.14.3"

echo "updating system"
apt update
apt upgrade -y

echo "installing necessary software (apt)"
apt install -y build-essential curl lsof snapd zip

echo "installing deno"
if [ ! -f "/opt/deno_$DENO_VERSION/deno" ]
then
  wget "https://github.com/denoland/deno/releases/download/v$DENO_VERSION/deno-x86_64-unknown-linux-gnu.zip" \
    -q -O /opt/deno_$DENO_VERSION.zip
  unzip /opt/deno_$DENO_VERSION.zip -d /opt/deno_$DENO_VERSION
  ln -s /opt/deno_$DENO_VERSION/deno /usr/local/bin/deno
fi

echo "test deno"
deno --version