#include <iostream>
#include <queue>   
#include <deque>    
#include <vector>
#include <functional>   

template<typename PQ>
void dumpPQ(const std::string& name, PQ pq)   
{
    std::cout << name << " (size=" << pq.size() << ") -> [ ";
    while (!pq.empty()) { std::cout << pq.top() << ' '; pq.pop(); }
    std::cout << "]\n";
}

int main() {
    std::priority_queue<int>                               pq_default;       
    std::priority_queue<int,std::vector<int>,std::greater<int>> pq_min;        
    std::priority_queue<int,std::vector<int>,std::less<int>>   pq_max;       

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

    std::deque<int> dq;

    dq.push_back(10);         
    dq.push_front(5);         
    dq.push_back(15);         
    dq.push_front(0);         

    std::cout << "front = " << dq.front() << ", back = " << dq.back() << '\n';
    dq[2] = 99;              
    dq.insert(dq.begin() + 2, 42);     
    dq.erase(dq.begin() + 3);          

    dq.pop_front(); dq.pop_back();     

    std::cout << "\n=== deque after ops ===\n[ ";
    for (int v : dq) std::cout << v << ' ';
    std::cout << "] size=" << dq.size() << '\n';
}
