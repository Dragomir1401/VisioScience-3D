#include <iostream>
#include <set>
#include <unordered_set>
#include <algorithm>   
template<class Set>
void dump(const char* name, const Set& s)
{
    std::cout << name << " = { ";
    for (int v : s) std::cout << v << ' ';
    std::cout << "} size=" << s.size() << '\n';
}

int main() {
    std::set<int> os;                      
    os.insert({5, 1, 3});                   
    os.insert(2);                           
    os.emplace(4);                         
    dump("ordered set", os);

    std::cout << "os.count(3) = " << os.count(3) << '\n'; 
    os.erase(1);                                         
    dump("after erase", os);

    std::unordered_set<int> us;
    us.insert({10,20,30});
    us.insert(20);                         
    dump("unordered set", us);

    int key = 25;
    std::cout << "find " << key << " -> "
              << (us.find(key)==us.end() ? "n/a" : "found") << '\n';
    us.erase(30);
    dump("after erase", us);

    std::multiset<int> ms{1,2,2,3};
    ms.insert(2);                          
    dump("multiset", ms);

    std::cout << "ms.count(2) = " << ms.count(2) << '\n';  

    auto itLow = ms.lower_bound(2);
    auto itUp  = std::next(itLow, 2);        
    ms.erase(itLow, itUp);
    dump("multiset after partial erase", ms);

#if __cplusplus >= 201703L
    std::set<int>   a{1,3,5},  b{2,3,4};
    a.merge(b);                                     
    dump("a after merge", a);                        
    dump("b after merge", b);                        
#endif
    return 0;
}
