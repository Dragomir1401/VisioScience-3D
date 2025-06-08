#include <iostream>
#include <vector>
#include <string>
#include <sstream>

// Helper function to print state in the required format
void printState(const std::string& type, const std::string& name, 
                const std::string& state, const std::string& operation,
                const std::string& description) {
    std::cout << "STATE:{\"type\":\"" << type << "\","
              << "\"name\":\"" << name << "\","
              << "\"state\":" << state << ","
              << "\"operation\":\"" << operation << "\","
              << "\"description\":\"" << description << "\"}" << std::endl;
}

// Helper function to convert vector to JSON array string
template<typename T>
std::string vectorToJson(const std::vector<T>& vec) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        ss << vec[i];
        if (i < vec.size() - 1) {
            ss << ",";
        }
    }
    ss << "]";
    return ss.str();
}

int main() {
    // Test array operations
    std::vector<int> arr = {1, 2, 3};
    printState("array", "numbers", vectorToJson(arr), "init", "Initial array state");

    // Insert operation
    arr.push_back(4);
    printState("array", "numbers", vectorToJson(arr), "insert", "Inserted element 4");

    // Delete operation
    arr.pop_back();
    printState("array", "numbers", vectorToJson(arr), "delete", "Deleted last element");

    // Search operation
    int searchValue = 2;
    bool found = false;
    for (int num : arr) {
        if (num == searchValue) {
            found = true;
            break;
        }
    }
    printState("array", "numbers", vectorToJson(arr), "search", 
               "Searching for value " + std::to_string(searchValue) + 
               (found ? " - Found" : " - Not found"));

    // Test string vector
    std::vector<std::string> words = {"hello", "world"};
    words.push_back("test");

    return 0;
} 