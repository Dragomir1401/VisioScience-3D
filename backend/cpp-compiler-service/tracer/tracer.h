#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>
#include <iostream>
#include <sstream>
#include <typeinfo>
#include <typeindex>
#include <chrono>

namespace tracer {

// Forward declarations
class Traceable;
class Tracer;

// Global tracer instance
extern Tracer* globalTracer;

// Helper function to convert any numeric type to string
template<typename T>
std::string toString(const T& value) {
    if constexpr (std::is_same_v<T, std::string>) {
        return "\"" + value + "\"";
    } else if constexpr (std::is_arithmetic_v<T>) {
        return std::to_string(value);
    } else {
        return std::string(value);
    }
}

// Helper function to serialize a pair
template<typename T1, typename T2>
std::string serializePair(const std::pair<T1, T2>& p) {
    return "{\"key\":" + toString(p.first) + 
           ",\"value\":" + toString(p.second) + "}";
}

// Helper function to serialize a value
template<typename T>
std::string serializeValue(const T& value) {
    return toString(value);
}

// Base class for all traceable objects
class Traceable {
public:
    virtual ~Traceable() = default;
    virtual std::string getType() const = 0;
    virtual std::string getName() const = 0;
    virtual std::string getState() const = 0;
    virtual std::string getMetadata() const = 0;
    virtual void traceOperation(const std::string& operation, const std::string& description) = 0;
};

// Main tracer class
class Tracer {
public:
    static Tracer& getInstance() {
        static Tracer instance;
        return instance;
    }

    void registerObject(Traceable* obj) {
        objects[obj->getName()] = obj;
    }

    void unregisterObject(Traceable* obj) {
        objects.erase(obj->getName());
    }

    void traceOperation(const std::string& name, const std::string& operation, 
                       const std::string& description) {
        auto it = objects.find(name);
        if (it != objects.end()) {
            it->second->traceOperation(operation, description);
        }
    }

    void snapshot() {
        auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        for (const auto& [name, obj] : objects) {
            std::cout << "STATE:{\"type\":\"" << obj->getType() << "\","
                     << "\"name\":\"" << obj->getName() << "\","
                     << "\"state\":" << obj->getState() << ","
                     << "\"metadata\":" << obj->getMetadata() << ","
                     << "\"operation\":\"snapshot\","
                     << "\"description\":\"Program state snapshot\","
                     << "\"timestamp\":" << timestamp << "}" << std::endl;
        }
    }

private:
    std::map<std::string, Traceable*> objects;
};

// Template for tracing containers
template<typename Container>
class ContainerTracer : public Traceable {
public:
    ContainerTracer(const std::string& name, Container& container)
        : name(name), container(container) {
        globalTracer->registerObject(this);
    }

    ~ContainerTracer() {
        globalTracer->unregisterObject(this);
    }

    std::string getType() const override {
        if constexpr (std::is_same_v<Container, std::map<typename Container::key_type, typename Container::mapped_type>>) {
            return "map";
        } else {
            return "container";
        }
    }

    std::string getName() const override {
        return name;
    }

    std::string getState() const override {
        std::string result = "[";
        bool first = true;
        for (const auto& item : container) {
            if (!first) result += ",";
            if constexpr (std::is_same_v<Container, std::map<typename Container::key_type, typename Container::mapped_type>>) {
                result += toString(item.second);
            } else {
                result += toString(item);
            }
            first = false;
        }
        result += "]";
        return result;
    }

    std::string getMetadata() const override {
        std::string result = "{";
        if constexpr (std::is_same_v<Container, std::map<typename Container::key_type, typename Container::mapped_type>>) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"key_type\":\"" + typeid(typename Container::key_type).name() + "\"," +
                     "\"value_type\":\"" + typeid(typename Container::mapped_type).name() + "\"";
        } else {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"capacity\":" + std::to_string(container.capacity()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        }
        result += "}";
        return result;
    }

    void traceOperation(const std::string& operation, const std::string& description) override {
        auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        std::cout << "STATE:{\"type\":\"" << getType() << "\","
                 << "\"name\":\"" << getName() << "\","
                 << "\"state\":" << getState() << ","
                 << "\"metadata\":" << getMetadata() << ","
                 << "\"operation\":\"" << operation << "\","
                 << "\"description\":\"" << description << "\","
                 << "\"timestamp\":" << timestamp << "}" << std::endl;
    }

private:
    std::string name;
    Container& container;
};

// Helper function to create a traced container
template<typename Container>
ContainerTracer<Container> makeTracedContainer(const std::string& name, Container& container) {
    return ContainerTracer<Container>(name, container);
}

} // namespace tracer 