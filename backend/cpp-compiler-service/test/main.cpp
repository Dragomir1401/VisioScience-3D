#include <iostream>
#include <unordered_map>
#include <stack>
#include <queue>
#include <array>
#include <list>
#include <forward_list>
#include <algorithm>

int main() {
    std::cout << "\n=== Array Operations ===\n";
    std::array<int, 5> arr = {1, 2, 3, 4, 5};
    
    // Fill array with a value
    arr.fill(10);
    std::cout << "After fill: ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\n";
    
    // Use array as a circular buffer
    for (int i = 0; i < 8; i++) {
        std::rotate(arr.begin(), arr.begin() + 1, arr.end());
        std::cout << "After rotation " << i + 1 << ": ";
        for (int x : arr) std::cout << x << " ";
        std::cout << "\n";
    }

    // Test list operations
    std::cout << "\n=== List Operations ===\n";
    std::list<int> lst = {1, 2, 3, 4, 5};
    
    // Splice operation
    std::list<int> other = {10, 20, 30};
    lst.splice(lst.begin(), other);
    std::cout << "After splice: ";
    for (int x : lst) std::cout << x << " ";
    std::cout << "\n";
    
    // Unique operation
    lst.push_back(10);
    lst.push_back(10);
    lst.push_back(20);
    lst.unique();
    std::cout << "After unique: ";
    for (int x : lst) std::cout << x << " ";
    std::cout << "\n";
    
    // Merge operation
    std::list<int> toMerge = {15, 25, 35};
    lst.merge(toMerge);
    std::cout << "After merge: ";
    for (int x : lst) std::cout << x << " ";
    std::cout << "\n";

    // Test forward_list operations
    std::cout << "\n=== Forward List Operations ===\n";
    std::forward_list<int> flst = {1, 2, 3, 4, 5};
    
    // Insert after specific position
    auto it = flst.begin();
    std::advance(it, 2);
    flst.insert_after(it, 100);
    std::cout << "After insert_after: ";
    for (int x : flst) std::cout << x << " ";
    std::cout << "\n";
    
    // Erase after specific position
    it = flst.begin();
    std::advance(it, 1);
    flst.erase_after(it);
    std::cout << "After erase_after: ";
    for (int x : flst) std::cout << x << " ";
    std::cout << "\n";
    
    // Splice after
    std::forward_list<int> other_fl = {50, 60, 70};
    it = flst.begin();
    std::advance(it, 2);
    flst.splice_after(it, other_fl);
    std::cout << "After splice_after: ";
    for (int x : flst) std::cout << x << " ";
    std::cout << "\n";
    
    // Remove if
    flst.remove_if([](int x) { return x % 2 == 0; });
    std::cout << "After remove_if (even numbers): ";
    for (int x : flst) std::cout << x << " ";
    std::cout << "\n";

    return 0;
}
