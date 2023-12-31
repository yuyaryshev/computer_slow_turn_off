// addon.cpp
#include <node.h>
#include <node_object_wrap.h>
#include "ScreenDimmer.h"

namespace {

    class ScreenDimmerWrapper : public node::ObjectWrap {
    public:
        static void Init(v8::Local<v8::Object> exports) {
            v8::Isolate* isolate = exports->GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            // Prepare constructor template
            v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, New);
            tpl->SetClassName(v8::String::NewFromUtf8(isolate, "ScreenDimmer").ToLocalChecked());
            tpl->InstanceTemplate()->SetInternalFieldCount(1);

            // Prototype
            NODE_SET_PROTOTYPE_METHOD(tpl, "getState", getState);
            NODE_SET_PROTOTYPE_METHOD(tpl, "setState", setState);
            NODE_SET_PROTOTYPE_METHOD(tpl, "getStateMax", getStateMax);
            NODE_SET_PROTOTYPE_METHOD(tpl, "setStateMax", setStateMax);
            NODE_SET_PROTOTYPE_METHOD(tpl, "systemShutdown", systemShutdown);
            // Add other functions here...

            constructor.Reset(isolate, tpl->GetFunction(context).ToLocalChecked());
            exports->Set(context, v8::String::NewFromUtf8(isolate, "ScreenDimmer").ToLocalChecked(), tpl->GetFunction(context).ToLocalChecked()).IsNothing();
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
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            if (args.IsConstructCall()) {
                long screenWidth = args[0]->IsUndefined() ? 0 : args[0]->NumberValue(context).FromMaybe(0);
                long screenHeight = args[1]->IsUndefined() ? 0 : args[1]->NumberValue(context).FromMaybe(0);

                ScreenDimmerWrapper* obj = new ScreenDimmerWrapper(screenWidth, screenHeight);
                obj->Wrap(args.This());
                args.GetReturnValue().Set(args.This());
            }
        }

        static void getState(const v8::FunctionCallbackInfo<v8::Value>& args) {
            v8::Isolate* isolate = args.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

            double state = obj->screenDimmer_->getState();
            args.GetReturnValue().Set(v8::Number::New(isolate, state));
        }

        static void setState(const v8::FunctionCallbackInfo<v8::Value>& args) {
            v8::Isolate* isolate = args.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

            if (args.Length() < 1 || !args[0]->IsNumber()) {
                isolate->ThrowException(v8::Exception::TypeError(
                    v8::String::NewFromUtf8(isolate, "Invalid arguments").ToLocalChecked()));
                return;
            }

            double state = args[0]->NumberValue(context).FromMaybe(0);
            obj->screenDimmer_->setState(state);
            args.GetReturnValue().SetUndefined();
        }
		
        static void getStateMax(const v8::FunctionCallbackInfo<v8::Value>& args) {
            v8::Isolate* isolate = args.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

            double state = obj->screenDimmer_->getStateMax();
            args.GetReturnValue().Set(v8::Number::New(isolate, state));
        }

        static void setStateMax(const v8::FunctionCallbackInfo<v8::Value>& args) {
            v8::Isolate* isolate = args.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

            obj->screenDimmer_->setStateMax();
            args.GetReturnValue().SetUndefined();
        }
		
        static void systemShutdown(const v8::FunctionCallbackInfo<v8::Value>& args) {
            v8::Isolate* isolate = args.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            ScreenDimmerWrapper* obj = ObjectWrap::Unwrap<ScreenDimmerWrapper>(args.Holder());

            obj->screenDimmer_->systemShutdown();
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
