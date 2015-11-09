#!/bin/sh

#
# generate cert and key with password
#
openssl req -x509 -newkey rsa:2048 -keyout temp.pem -out cert.pem -days 3650
# Generating a 2048 bit RSA private key
# .............................................+++
# ..........................................................................+++
# writing new private key to 'temp.pem'
# Enter PEM pass phrase:
# Verifying - Enter PEM pass phrase:
# -----
# You are about to be asked to enter information that will be incorporated
# into your certificate request.
# What you are about to enter is what is called a Distinguished Name or a DN.
# There are quite a few fields but you can leave some blank
# For some fields there will be a default value,
# If you enter '.', the field will be left blank.
# -----
# Country Name (2 letter code) [AU]:JP
# State or Province Name (full name) [Some-State]:Kanagawa
# Locality Name (eg, city) []:Yokosuka
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:Kanagawa Dental University
# Organizational Unit Name (eg, section) []:Network Administration Department
# Common Name (e.g. server FQDN or YOUR name) []:localhost
# Email Address []:


#
# remove password from key
#
openssl rsa -in temp.pem -out key.pem
# Enter pass phrase for temp.pem:
# writing RSA key
