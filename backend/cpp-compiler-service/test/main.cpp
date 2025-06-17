#include <iostream>
#include <set>
#include <unordered_set>
#include <algorithm>   



int main() {
    std::set<int> os;                       
    os.insert({5, 1, 3});                  
    os.insert(2);                          
    os.emplace(4);                          

    std::cout << "os.count(3) = " << os.count(3) << '\n'; 
    os.erase(1);                                          

    std::unordered_set<int> us;
    us.insert({10,20,30});
    us.insert(20);                          

    int key = 25;
    std::cout << "find " << key << " -> "
              << (us.find(key)==us.end() ? "n/a" : "found") << '\n';
    us.erase(30);

    std::multiset<int> ms{1,2,2,3};
    ms.insert(2);                           

    std::cout << "ms.count(2) = " << ms.count(2) << '\n'; 

    auto itLow = ms.lower_bound(2);
    auto itUp  = std::next(itLow, 2);        
    ms.erase(itLow, itUp);

#if __cplusplus >= 201703L
    std::set<int>   a{1,3,5},  b{2,3,4};
    a.merge(b);                                      
#endif
    return 0;
}
