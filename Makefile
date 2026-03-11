SHELL := /bin/zsh

.DEFAULT_GOAL := dev
.PHONY: dev init clean re

node_modules: package.json
	npm install

init: node_modules

dev: node_modules
	npm run dev

clean:
	rm -rf node_modules dist

re: clean
	npm install
	npm run dev
