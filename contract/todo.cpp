#include <eosio/eosio.hpp>
#include <eosio/system.hpp>

#define MAX_TODOS 100

using namespace eosio;
using namespace std;

class [[eosio::contract("todo")]] todo_contract : public contract
{
public:
    using contract::contract;

    struct [[eosio::table]] todo_row
    {
        uint64_t id;
        name author;
        time_point timestamp;
        string description;
        uint64_t primary_key() const { return id; }
    };
    typedef eosio::multi_index<name("todos"), todo_row>
        todos_table;

    todo_contract(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds)
    {
    }

    [[eosio::action]] void add(name author, string description)
    {
        require_auth(author);
        todos_table todos(_self, author.value);  // Use author as scope
        todos.emplace(author, [&](todo_row &row) {
            row.id = todos.available_primary_key();
            row.author = author;
            row.timestamp = current_time_point();
            row.description = description;
        });
        auto last = todos.rbegin();
        if (last->id >= MAX_TODOS)
        {
            todos.erase(todos.begin());
        }
    }

    [[eosio::action]] void erase(name author, uint64_t id)
    {
        require_auth(author);
        todos_table todos(_self, author.value);  // Use author as scope
        auto itr = todos.find(id);
        check(itr != todos.end(), "Todo not found");
        check(itr->author == author, "You are not the author");
        todos.erase(itr);
    }

    [[eosio::action]] void eraseall(name author)
    {
        require_auth(author);
        todos_table todos(_self, author.value);  // Use author as scope
        auto itr = todos.begin();
        while (itr != todos.end())
        {
            itr = todos.erase(itr);
        }
    }
};
