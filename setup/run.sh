#!/bin/bash

# Messenger Translator
# Copyright (C) 2020 Adriane Justine Tan
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

openssl version
curl --version

proof=$(echo -n "$ACCESS_TOKEN" | openssl sha256 -hmac $APP_SECRET)
proof=$(echo "$proof" | sed -e 's/^.* //')
param="access_token=$ACCESS_TOKEN&appsecret_proof=$proof"
data=$(< "`dirname $0`/profile.json")

echo 'Setting up...'
curl -X POST \
  -H 'Content-Type: application/json' \
  -d "${data[@]}" \
  --url "https://graph.facebook.com/v7.0/me/messenger_profile?$param"
