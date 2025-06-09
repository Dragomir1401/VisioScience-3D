#include <iostream>
#include <queue>    // priority_queue
#include <deque>    // deque
#include <vector>
#include <functional>   // std::greater / std::less

template<typename PQ>
void dumpPQ(const std::string& name, PQ pq)    // by-value copy → nu golim originalul
{
    std::cout << name << " (size=" << pq.size() << ") -> [ ";
    while (!pq.empty()) { std::cout << pq.top() << ' '; pq.pop(); }
    std::cout << "]\n";
}

int main() {
    /*------------------------------------------------------------------
      1. priority_queue –  trei variante
    ------------------------------------------------------------------*/
    std::priority_queue<int>                               pq_default;        // implicit std::less<int>  (max-heap)
    std::priority_queue<int,std::vector<int>,std::greater<int>> pq_min;        // min-heap
    std::priority_queue<int,std::vector<int>,std::less<int>>   pq_max;        // explicit max-heap

    int data[] = {7, 1, 5, 3, 9};

    for (int x : data) {
        pq_default.push(x);
        pq_min.push(x);
        pq_max.push(x);
    }

    std::cout << "=== priority_queue tests ===\n";
    dumpPQ("default (max-heap)", pq_default);
    dumpPQ("min-heap (greater)", pq_min);
    dumpPQ("max-heap (less)",    pq_max);
    std::cout << '\n';

    /*------------------------------------------------------------------
      2. deque<int>  –   operaţii de bază
    ------------------------------------------------------------------*/
    std::deque<int> dq;

    // push în ambele capete
    dq.push_back(10);         // [10]
    dq.push_front(5);         // [5 10]
    dq.push_back(15);         // [5 10 15]
    dq.push_front(0);         // [0 5 10 15]

    // acces şi modificare
    std::cout << "front = " << dq.front() << ", back = " << dq.back() << '\n';
    dq[2] = 99;               // random-access write  → [0 5 99 15]

    // insert & erase (la mijloc)
    dq.insert(dq.begin() + 2, 42);      // [0 5 42 99 15]
    dq.erase(dq.begin() + 3);           // şterge 99       → [0 5 42 15]

    // pop din ambele capete
    dq.pop_front(); dq.pop_back();      // [5 42]

    // afişare finală
    std::cout << "\n=== deque after ops ===\n[ ";
    for (int v : dq) std::cout << v << ' ';
    std::cout << "] size=" << dq.size() << '\n';
}
