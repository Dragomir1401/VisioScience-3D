#include <iostream>
#include <set>
#include <unordered_set>
#include <algorithm>
#include <queue>
#include <deque>
#include <functional>

int main() {
    std::cout << "\n=== Priority Queue Operations ===\n";
    std::priority_queue<int> pq;
    
    // Push operations
    pq.push(5);
    pq.push(2);
    pq.push(8);
    pq.push(1);
    pq.push(9);
    
    std::cout << "After pushing elements: ";
    while (!pq.empty()) {
        std::cout << pq.top() << " ";
        pq.pop();
    }
    std::cout << "\n";
    
    std::priority_queue<int, std::vector<int>, std::greater<int>> altpq;
    altpq.push(5);
    altpq.push(2);
    altpq.push(8);
    altpq.push(1);
    altpq.push(9);
    
    std::cout << "Min priority queue: ";
    while (!altpq.empty()) {
        std::cout << altpq.top() << " ";
        altpq.pop();
    }
    std::cout << "\n";

    std::cout << "\n=== Deque Operations ===\n";
    std::deque<int> dq = {1, 2, 3, 4, 5};
    
    // Front operations
    dq.push_front(0);
    std::cout << "After push_front(0): ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Back operations
    dq.push_back(6);
    std::cout << "After push_back(6): ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Pop operations
    dq.pop_front();
    std::cout << "After pop_front(): ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    dq.pop_back();
    std::cout << "After pop_back(): ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Access operations
    std::cout << "Front element: " << dq.front() << "\n";
    std::cout << "Back element: " << dq.back() << "\n";
    std::cout << "Element at index 2: " << dq[2] << "\n";
    std::cout << "Element at index 3 using at(): " << dq.at(3) << "\n";
    
    // Insert operations
    dq.insert(dq.begin() + 2, 10);
    std::cout << "After insert at position 2: ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Erase operations
    dq.erase(dq.begin() + 2);
    std::cout << "After erase at position 2: ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Resize operations
    dq.resize(8, 0);
    std::cout << "After resize to 8: ";
    for (int x : dq) std::cout << x << " ";
    std::cout << "\n";
    
    // Shrink to fit
    dq.shrink_to_fit();
    std::cout << "After shrink_to_fit()\n";
    
    // Clear
    dq.clear();
    std::cout << "After clear, size: " << dq.size() << "\n";

    return 0;
}
