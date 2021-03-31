SRC_FILES := $(shell find src -type f)
BIN := ./node_modules/.bin

.EXPORT_ALL_VARIABLES:
CONTRACT ?= hello
CONTRACT_ACCOUNT ?= $(CONTRACT).gm
NODE_URL ?= https://jungle3.greymass.com
CHAIN_ID ?= 2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840
REV := $(shell git rev-parse --short HEAD)
BRANCH := $(shell echo $${HEAD:-$$(git branch --show-current)})

build: $(SRC_FILES) src/contract-types.ts node_modules package.json snowpack.config.js svelte.config.js tsconfig.json yarn.lock
	${BIN}/snowpack build

node_modules:
	yarn install --non-interactive --frozen-lockfile

contract/%.abi: contract/%.cpp contract/%.contracts.md
	eosio-cpp -R contract -contract=$(notdir $(basename $<)) \
		-abigen -abigen_output=$@ -o $(basename $<).wasm -O3 $<

src/contract-types.ts: contract/$(CONTRACT).abi
	${BIN}/abi2core <$< > src/contract-types.ts

.PHONY: dev
dev: node_modules src/contract-types.ts
	@${BIN}/snowpack dev

.PHONY: contract
contract: contract/$(CONTRACT).abi

.PHONY: deploy-contract
deploy-contract: contract
	cleos -u $(NODE_URL) set contract \
		$(CONTRACT_ACCOUNT) contract/ ${CONTRACT}.wasm ${CONTRACT}.abi

.PHONY: check
check: node_modules
	@${BIN}/svelte-check
	@${BIN}/prettier -c src
	@${BIN}/eslint --max-warnings 0 src

.PHONY: format
format: node_modules
	@${BIN}/eslint --fix src
	@${BIN}/prettier -w src

.PHONY: clean
clean:
	rm -rf build/
	rm -f contract/*.abi
	rm -f contract/*.wasm
	rm -f src/contract-types.ts

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
