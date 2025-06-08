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
        return "container";
    }

    std::string getName() const override {
        return name;
    }

    std::string getState() const override {
        std::stringstream ss;
        ss << "[";
        bool first = true;
        for (const auto& item : container) {
            if (!first) ss << ",";
            if constexpr (std::is_same_v<typename Container::value_type, std::string>) {
                ss << "\"" << item << "\"";
            } else {
                ss << item;
            }
            first = false;
        }
        ss << "]";
        return ss.str();
    }

    std::string getMetadata() const override {
        std::stringstream ss;
        ss << "{"
           << "\"size\":" << container.size() << ","
           << "\"capacity\":" << container.capacity() << ","
           << "\"empty\":" << (container.empty() ? "true" : "false") << ","
           << "\"element_type\":\"" << typeid(typename Container::value_type).name() << "\""
           << "}";
        return ss.str();
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