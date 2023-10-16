BIN := ./node_modules/.bin

.EXPORT_ALL_VARIABLES:
CONTRACT ?= hello
CONTRACT_ACCOUNT ?= $(CONTRACT).gm
NODE_URL ?= https://jungle3.greymass.com
CHAIN_ID ?= 2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840
REV := $(shell git rev-parse --short HEAD)
BRANCH := $(shell echo $${HEAD:-$$(git branch --show-current)})

node_modules:
	yarn install --non-interactive --frozen-lockfile

contract/%.abi: contract/%.cpp contract/%.contracts.md
	eosio-cpp -R contract -contract=$(notdir $(basename $<)) \
		-abigen -abigen_output=$@ -o $(basename $<).wasm -O3 $<

src/contract-types.ts: contract/$(CONTRACT).abi
	${BIN}/abi2core <$< > types/contract-types.ts

.PHONY: contract
contract: contract/$(CONTRACT).abi

.PHONY: deploy-contract
deploy-contract: contract
	cleos -u $(NODE_URL) set contract \
		$(CONTRACT_ACCOUNT) contract/ ${CONTRACT}.wasm ${CONTRACT}.abi

.PHONY: clean
clean:
	rm -rf build/
	rm -f contract/*.abi
	rm -f contract/*.wasm
	rm -f types/contract-types.ts
	rm -rf node_modules/.cache

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
