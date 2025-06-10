#include <iostream>
#include <list>
#include <forward_list>
#include <array>
#include <algorithm>   // sort, reverse
#include <numeric>     // iota

/* util pentru afişare ---------------------------------------------------- */
template<class Cont>
void dump(const char* name, const Cont& c)
{
    std::cout << name << " = [ ";
    for (auto v : c) std::cout << v << ' ';
    std::cout << "] size=" << std::size(c) << '\n';   // std::size <C++17: c.size()
}

/* suprasarcină pt. forward_list (nu are size()) -------------------------- */
template<class T>
void dump(const char* name, const std::forward_list<T>& fl)
{
    std::cout << name << " = [ ";
    auto n = 0;
    for (auto v : fl) { std::cout << v << ' '; ++n; }
    std::cout << "] size=" << n << '\n';
}

int main() {
/*---------------------------------------------------------------------- */
/* 1) std::list<int>  –  doubly-linked                                  */
/*---------------------------------------------------------------------- */
    std::list<int> dl{1, 2, 3};
    dl.push_back(4);                  // … 3 4
    dl.push_front(0);                 // 0 …
    auto it = std::next(dl.begin(),2);
    dl.insert(it, 99);                // 0 1 99 2 …
    dl.remove(3);                     // şterge prin valoare
    dl.sort();                        // sortare stabilă
    dl.reverse();                     // inversare

    dump("doubly list", dl);

/*---------------------------------------------------------------------- */
/* 2) std::forward_list<int> – singly-linked                             */
/*---------------------------------------------------------------------- */
    std::forward_list<int> sl = {10, 20, 30};
    sl.push_front(5);                 // 5 10 20 30
    auto fit = sl.begin();
    sl.insert_after(fit, 15);         // după 5 ⇒ 5 15 10 …
    sl.erase_after(fit);              // şterge 15
    sl.sort();
    sl.reverse();

    dump("singly list", sl);

/*---------------------------------------------------------------------- */
/* 3) std::array<int,5>                                                  */
/*---------------------------------------------------------------------- */
    std::array<int,5> arr;
    std::iota(arr.begin(), arr.end(), 1);   // 1 2 3 4 5
    arr[2] = 99;                            // index-based write
    std::swap(arr[0], arr[4]);              // swap elemente
    dump("array", arr);

    std::cout << "front=" << arr.front()
              << " back=" << arr.back()
              << " size=" << arr.size() << '\n';

    return 0;
}
