#include <iostream>
#include <list>
#include <forward_list>
#include <array>
#include <algorithm>   
#include <numeric>    

template<class Cont>
void dump(const char* name, const Cont& c)
{
    std::cout << name << " = [ ";
    for (auto v : c) std::cout << v << ' ';
    std::cout << "] size=" << std::size(c) << '\n';  
}

template<class T>
void dump(const char* name, const std::forward_list<T>& fl)
{
    std::cout << name << " = [ ";
    auto n = 0;
    for (auto v : fl) { std::cout << v << ' '; ++n; }
    std::cout << "] size=" << n << '\n';
}

int main() {
    std::list<int> dl{1, 2, 3};
    dl.push_back(4);                 
    dl.push_front(0);                
    auto it = std::next(dl.begin(),2);
    dl.insert(it, 99);                
    dl.remove(3);                     
    dl.sort();                        
    dl.reverse();                    

    dump("doubly list", dl);

    std::forward_list<int> sl = {10, 20, 30};
    sl.push_front(5);                
    auto fit = sl.begin();
    sl.insert_after(fit, 15);         
    sl.erase_after(fit);             
    sl.sort();
    sl.reverse();

    dump("singly list", sl);

    std::array<int,5> arr;
    std::iota(arr.begin(), arr.end(), 1);  
    arr[2] = 99;                            
    std::swap(arr[0], arr[4]);             
    dump("array", arr);

    std::cout << "front=" << arr.front()
              << " back=" << arr.back()
              << " size=" << arr.size() << '\n';

    return 0;
}
