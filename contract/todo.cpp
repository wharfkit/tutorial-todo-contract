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
        uint64_t completed;  // Use uint64_t for completed status: 0 for incomplete, 1 for completed
        uint64_t primary_key() const { return id; }
        uint64_t get_completed() const { return completed; }  // Getter for the secondary index
    };

    typedef eosio::multi_index<name("todos"), todo_row, 
        indexed_by<name("completedidx"), const_mem_fun<todo_row, uint64_t, &todo_row::get_completed>>>
        todos_table;  // Secondary index for the "completed" field

    todo_contract(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds)
    {
    }

    [[eosio::action]] todo_row add(name author, string description)
    {
        require_auth(author);
        todos_table todos(_self, author.value);
        auto itr = todos.emplace(_self, [&](todo_row &row) {  // Contract pays for RAM
            row.id = todos.available_primary_key();
            row.author = author;
            row.timestamp = current_time_point();
            row.description = description;
            row.completed = 0;  // Default value for new todos (0 means incomplete)
        });
        auto last = todos.rbegin();
        if (last->id >= MAX_TODOS)
        {
            todos.erase(todos.begin());
        }
        return *itr;
    }

    [[eosio::action]] void erase(name author, uint64_t id)
    {
        require_auth(author);
        todos_table todos(_self, author.value);
        auto itr = todos.find(id);
        check(itr != todos.end(), "Todo not found");
        check(itr->author == author, "You are not the author");
        todos.erase(itr);
    }

    [[eosio::action]] void setcomplete(name author, uint64_t id, bool complete)
    {
        require_auth(author);
        todos_table todos(_self, author.value);
        auto itr = todos.find(id);
        check(itr != todos.end(), "Todo not found");
        check(itr->author == author, "You are not the author");
        todos.modify(itr, _self, [&](todo_row &row) {  // Contract pays for RAM
            row.completed = complete ? 1 : 0;  // Set the todo as completed (1) or incomplete (0) based on the boolean value
        });
    }


    [[eosio::action]] void eraseall(name author)
    {
        require_auth(author);
        todos_table todos(_self, author.value);
        auto itr = todos.begin();
        while (itr != todos.end())
        {
            itr = todos.erase(itr);
        }
    }
};
