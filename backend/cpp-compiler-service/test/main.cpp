#include <iostream>
#include <unordered_map>
#include <stack>
#include <queue>

int main() {
    std::unordered_map<int,int> umap;
    std::stack<int> s;
    std::queue<int> q;

    struct Step { std::string cmd; int key, val; };
    Step script[] = {
        /*0*/ {"insert", 10, 100},
        /*1*/ {"insert", 20, 200},
        /*2*/ {"update", 10, 150},
        /*3*/ {"find",   20, 0  },
        /*4*/ {"erase",  10, 0  }
    };

    for (const auto& s : script) {
        if (s.cmd == "insert") {
            auto [it, fresh] = umap.insert({s.key, s.val});
            if (!fresh)
                std::cout << "(skip) key " << s.key << " already present\n";
        }
        else if (s.cmd == "update") {
            umap[s.key] = s.val;                 // operator[] update/insert
        }
        else if (s.cmd == "find") {
            auto it = umap.find(s.key);
            std::cout << "[find] " << s.key << " -> "
                      << (it != umap.end() ? std::to_string(it->second)
                                           : "n/a") << '\n';
        }
        else if (s.cmd == "erase") {
            std::cout << "[erase] " << s.key
                      << " -> " << umap.erase(s.key) << '\n';
        }

        /*  afișăm starea după fiecare operație  ------------------------ */
        std::cout << "step '" << s.cmd << "': { ";
        for (auto [k,v] : umap) std::cout << k << ":" << v << ' ';
        std::cout << "} size=" << umap.size() << "\n\n";
    }

    // Test stack operations
    std::cout << "=== Stack Operations ===\n";
    s.push(10);
    std::cout << "Pushed 10 to stack\n";
    s.push(20);
    std::cout << "Pushed 20 to stack\n";
    s.push(30);
    std::cout << "Pushed 30 to stack\n";
    
    std::cout << "Stack top: " << s.top() << "\n";
    s.pop();
    std::cout << "Popped from stack\n";
    std::cout << "Stack top: " << s.top() << "\n";
    s.pop();
    std::cout << "Popped from stack\n";
    std::cout << "Stack top: " << s.top() << "\n";

    // Test queue operations
    std::cout << "\n=== Queue Operations ===\n";
    q.push(100);
    std::cout << "Pushed 100 to queue\n";
    q.push(200);
    std::cout << "Pushed 200 to queue\n";
    q.push(300);
    std::cout << "Pushed 300 to queue\n";

    std::cout << "Queue front: " << q.front() << "\n";
    q.pop();
    std::cout << "Popped from queue\n";
    std::cout << "Queue front: " << q.front() << "\n";
    q.pop();
    std::cout << "Popped from queue\n";
    std::cout << "Queue front: " << q.front() << "\n";

    return 0;
}
