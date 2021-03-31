#include <eosio/eosio.hpp>
#include <eosio/system.hpp>

#define MAX_MESSAGES 100

using namespace eosio;
using namespace std;

class [[eosio::contract("hello")]] hello_contract : public contract
{
public:
    using contract::contract;

    struct [[eosio::table]] message_row
    {
        uint64_t id;
        name author;
        time_point timestamp;
        string text;
        uint64_t primary_key() const { return id; }
    };
    typedef eosio::multi_index<name("messages"), message_row>
        messages_table;
    messages_table messages;

    hello_contract(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds), messages(_self, _self.value)
    {
    }

    [[eosio::action]] void post(name author, string text)
    {
        require_auth(author);
        messages.emplace(author, [&](message_row &row) {
            row.id = messages.available_primary_key();
            row.author = author;
            row.timestamp = current_time_point();
            row.text = text;
        });
        auto last = messages.rbegin();
        if (last->id >= MAX_MESSAGES)
        {
            messages.erase(messages.begin());
        }
    }
};
