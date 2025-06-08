#include <iostream>
#include <map>
#include <string>
#include <sstream>

int main() {
    // Test map operations
    std::map<std::string, int> scores;
    
    // Insert operations
    scores["John"] = 85;
    scores["Alice"] = 92;
    scores["Bob"] = 78;
    
    // Update operation
    scores["John"] = 90;
    
    // Delete operation
    scores.erase("Bob");
    
    // Search operation
    std::string searchName = "Alice";
    auto it = scores.find(searchName);
    if (it != scores.end()) {
        std::cout << "Found " << searchName << " with score: " << it->second << std::endl;
    } else {
        std::cout << searchName << " not found" << std::endl;
    }
    
    // Iterate through map
    for (const auto& pair : scores) {
        std::cout << pair.first << ": " << pair.second << std::endl;
    }
    
    return 0;
} 