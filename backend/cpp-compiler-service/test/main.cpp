#include <iostream>
#include <set>
#include <unordered_set>
#include <algorithm>   // merge, includes



int main() {
/*-----------------------------------------------------------------------
  1) std::set  – mulțime ordonată, elemente unice
 -----------------------------------------------------------------------*/
    std::set<int> os;                       // gol
    os.insert({5, 1, 3});                   // insert range
    os.insert(2);                           // insert single
    os.emplace(4);                          // emplace

    std::cout << "os.count(3) = " << os.count(3) << '\n';  // 1
    os.erase(1);                                          // șterge cheie

/*-----------------------------------------------------------------------
  2) std::unordered_set – hash-set, elemente unice (fără ordine)
 -----------------------------------------------------------------------*/
    std::unordered_set<int> us;
    us.insert({10,20,30});
    us.insert(20);                          // duplicatul este ignorat

    int key = 25;
    std::cout << "find " << key << " -> "
              << (us.find(key)==us.end() ? "n/a" : "found") << '\n';
    us.erase(30);

/*-----------------------------------------------------------------------
  3) std::multiset – ordonat, dar permite duplicate
 -----------------------------------------------------------------------*/
    std::multiset<int> ms{1,2,2,3};
    ms.insert(2);                           // încă un duplicat

    std::cout << "ms.count(2) = " << ms.count(2) << '\n';  // 3

    // erase DOAR primele două valori 2
    auto itLow = ms.lower_bound(2);
    auto itUp  = std::next(itLow, 2);        // +2 poziții
    ms.erase(itLow, itUp);

/*-----------------------------------------------------------------------
  4) operație comună: merge (C++17) pe set-uri
 -----------------------------------------------------------------------*/
#if __cplusplus >= 201703L
    std::set<int>   a{1,3,5},  b{2,3,4};
    a.merge(b);                                      // mută elementele
#endif
    return 0;
}
