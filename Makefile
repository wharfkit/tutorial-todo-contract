BIN := ./node_modules/.bin

.EXPORT_ALL_VARIABLES:
CONTRACT ?= todo
CONTRACT_ACCOUNT ?= $(CONTRACT).gm
NODE_URL ?= https://jungle4.greymass.com
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
