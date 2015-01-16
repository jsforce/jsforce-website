#!/bin/sh
git config user.name ${GIT_NAME} &&
git config user.email ${GIT_EMAIL} &&
git config credential.helper "store --file=.git/credentials" &&
echo "https://${GITHUB_TOKEN}:@github.com" > .git/credentials &&
git checkout -b release &&
git add out --force &&
git commit -am "Generate Website from docpad" &&
echo "Adding remote : ${GITHUB_PAGES_GIT_URL}" &&
git remote add pages ${GITHUB_PAGES_GIT_URL} &&
git push pages `git subtree split --prefix out release`:master --force &&
git remote remove pages &&
git checkout master &&
git branch -D release &&
rm .git/credentials
exit $?
