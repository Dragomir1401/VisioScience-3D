#include <iostream>
#include <set>
#include <unordered_set>
#include <algorithm>

int main() {
    std::cout << "\n=== Set Operations ===\n";
    std::set<int> s = {1, 2, 3, 4, 5};
    
    // Insert operations
    s.insert(6);
    std::cout << "After insert 6: ";
    for (int x : s) std::cout << x << " ";
    std::cout << "\n";
    
    // Insert with hint
    auto it = s.find(3);
    s.insert(it, 7);
    std::cout << "After insert with hint: ";
    for (int x : s) std::cout << x << " ";
    std::cout << "\n";
    
    // Insert range
    std::vector<int> v = {8, 9, 10};
    s.insert(v.begin(), v.end());
    std::cout << "After insert range: ";
    for (int x : s) std::cout << x << " ";
    std::cout << "\n";
    
    // Erase operations
    s.erase(5);
    std::cout << "After erase 5: ";
    for (int x : s) std::cout << x << " ";
    std::cout << "\n";
    
    // Erase with iterator
    it = s.find(3);
    s.erase(it);
    std::cout << "After erase iterator: ";
    for (int x : s) std::cout << x << " ";
    std::cout << "\n";
    
    // Find operations
    it = s.find(4);
    if (it != s.end()) {
        std::cout << "Found 4 in set\n";
    }
    
    // Count operations
    std::cout << "Count of 4: " << s.count(4) << "\n";
    std::cout << "Count of 20: " << s.count(20) << "\n";
    
    // Lower and upper bound
    s.insert({11, 12, 13, 14, 15});
    auto lower = s.lower_bound(10);
    auto upper = s.upper_bound(14);
    std::cout << "Elements between 10 and 14: ";
    for (auto i = lower; i != upper; ++i) {
        std::cout << *i << " ";
    }
    std::cout << "\n";
    
    // Equal range
    auto range = s.equal_range(12);
    std::cout << "Equal range for 12: ";
    for (auto i = range.first; i != range.second; ++i) {
        std::cout << *i << " ";
    }
    std::cout << "\n";
    
    // Clear
    s.clear();
    std::cout << "After clear, size: " << s.size() << "\n";

    std::cout << "\n=== Unordered Set Operations ===\n";
    std::unordered_set<int> us = {1, 2, 3, 4, 5};
    
    // Insert
    us.insert(6);
    std::cout << "After insert 6: ";
    for (int x : us) std::cout << x << " ";
    std::cout << "\n";
    
    // Insert range
    us.insert(v.begin(), v.end());
    std::cout << "After insert range: ";
    for (int x : us) std::cout << x << " ";
    std::cout << "\n";
    
    // Erase
    us.erase(5);
    std::cout << "After erase 5: ";
    for (int x : us) std::cout << x << " ";
    std::cout << "\n";
    
    // Find
    if (us.find(4) != us.end()) {
        std::cout << "Found 4 in unordered_set\n";
    }
    
    // Count
    std::cout << "Count of 4: " << us.count(4) << "\n";
    
    // Clear
    us.clear();
    std::cout << "After clear, size: " << us.size() << "\n";

    std::cout << "\n=== Multiset Operations ===\n";
    std::multiset<int> ms = {1, 2, 2, 3, 3, 3, 4, 4, 4, 4};
    
    // Insert
    ms.insert(5);
    std::cout << "After insert 5: ";
    for (int x : ms) std::cout << x << " ";
    std::cout << "\n";
    
    // Insert multiple
    ms.insert(3);
    ms.insert(3);
    std::cout << "After insert multiple 3: ";
    for (int x : ms) std::cout << x << " ";
    std::cout << "\n";
    
    // Count
    std::cout << "Count of 3: " << ms.count(3) << "\n";
    
    // Lower and upper bound
    auto ms_lower = ms.lower_bound(3);
    auto ms_upper = ms.upper_bound(3);
    std::cout << "All 3s: ";
    for (auto i = ms_lower; i != ms_upper; ++i) {
        std::cout << *i << " ";
    }
    std::cout << "\n";
    
    // Equal range
    auto ms_range = ms.equal_range(4);
    std::cout << "All 4s: ";
    for (auto i = ms_range.first; i != ms_range.second; ++i) {
        std::cout << *i << " ";
    }
    std::cout << "\n";
    
    // Erase
    ms.erase(3);
    std::cout << "After erase all 3s: ";
    for (int x : ms) std::cout << x << " ";
    std::cout << "\n";
    
    // Clear
    ms.clear();
    std::cout << "After clear, size: " << ms.size() << "\n";

    std::cout << "\n=== Unordered Multiset Operations ===\n";
    std::unordered_multiset<int> ums = {1, 2, 2, 3, 3, 3, 4, 4, 4, 4};
    
    // Insert
    ums.insert(5);
    std::cout << "After insert 5: ";
    for (int x : ums) std::cout << x << " ";
    std::cout << "\n";
    
    // Insert multiple
    ums.insert(3);
    ums.insert(3);
    std::cout << "After insert multiple 3: ";
    for (int x : ums) std::cout << x << " ";
    std::cout << "\n";
    
    // Count
    std::cout << "Count of 3: " << ums.count(3) << "\n";
    
    // Find
    auto ums_range = ums.equal_range(4);
    std::cout << "All 4s: ";
    for (auto i = ums_range.first; i != ums_range.second; ++i) {
        std::cout << *i << " ";
    }
    std::cout << "\n";
    
    // Erase
    ums.erase(3);
    std::cout << "After erase all 3s: ";
    for (int x : ums) std::cout << x << " ";
    std::cout << "\n";
    
    // Clear
    ums.clear();
    std::cout << "After clear, size: " << ums.size() << "\n";

    return 0;
}
