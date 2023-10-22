// addon.cpp
#include <node.h>
#include <node_object_wrap.h>
#include "../../src/ScreenDimmer.h"

namespace {

class ScreenDimmerWrapper : public node::ObjectWrap {
public:
    static void Init(v8::Local<v8::Object> exports) {
        v8::Isolate* isolate = exports->GetIsolate();

        // Prepare constructor template
        v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, New);
        tpl->SetClassName(v8::String::NewFromUtf8(isolate, "ScreenDimmer").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        // Prototype
        NODE_SET_PROTOTYPE_METHOD(tpl, "getState", GetState);
        NODE_SET_PROTOTYPE_METHOD(tpl, "setState", SetState);
        // Add other functions here...

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(v8::String::NewFromUtf8(isolate, "ScreenDimmer"), tpl->GetFunction());
    }

private:
    explicit ScreenDimmerWrapper(long screenWidth, long screenHeight) {
        screenDimmer_ = new ScreenDimmer(screenWidth, screenHeight);
    }

    ~ScreenDimmerWrapper() {
        delete screenDimmer_;
    }

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall()) {
            long screenWidth = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
            long screenHeight = args[1]->IsUndefined() ? 0 : args[1]->NumberValue();

            ScreenDimmerWrapper* obj = new ScreenDimmerWrapper(screenWidth, screenHeight);
            obj->Wrap(args.This());
            args.GetReturnValue().Set(args.This());
        }
    }

    static void GetState(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

        double state = obj->screenDimmer_->getState();
        args.GetReturnValue().Set(v8::Number::New(isolate, state));
    }

    static void SetState(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

        if (args.Length() < 1 || !args[0]->IsNumber()) {
            isolate->ThrowException(v8::Exception::TypeError(
                v8::String::NewFromUtf8(isolate, "Invalid arguments")));
            return;
        }

        double state = args[0]->NumberValue();
        obj->screenDimmer_->setState(state);
        args.GetReturnValue().SetUndefined();
    }

    // Add other function implementations...

    static v8::Persistent<v8::Function> constructor;
    ScreenDimmer* screenDimmer_;
};

v8::Persistent<v8::Function> ScreenDimmerWrapper::constructor;

void Init(v8::Local<v8::Object> exports) {
    ScreenDimmerWrapper::Init(exports);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace
