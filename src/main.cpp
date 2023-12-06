#include "stdafx.h"

#define _WIN32_WINNT 0x500

#include <windows.h>
#include <tchar.h>
#include <CommCtrl.h>
#include <fstream>
#include <iostream>
#include "json.hpp"
#include <algorithm>

#include "utilFuncs.h"
#include "ScreenDimmer.h"
#include "settings.h"
#include <chrono>

static UINT_PTR timerId;
void CALLBACK TimerProc(HWND hwnd, UINT uMsg, UINT_PTR idEvent, DWORD dwTime) {}

double millisecondsSinceEpoch() {
    // Get the current time point
    auto currentTime = std::chrono::high_resolution_clock::now();

    // Convert the time point to milliseconds
    auto currentTimeMillis = std::chrono::time_point_cast<std::chrono::milliseconds>(currentTime);

    // Get the number of milliseconds since the epoch
    long long millisecondsSinceEpoch = currentTimeMillis.time_since_epoch().count();
    return millisecondsSinceEpoch;
}

int APIENTRY WinMain(HINSTANCE hInst, HINSTANCE hInstPrev, LPSTR cmd, int show) {
    double startTimeMillis = millisecondsSinceEpoch();
    Settings settings = LoadSettings();

    if (settings.removeThisSetting) {
        std::cerr << "remove_this_setting is present in settings.json. This setting prevents program from running without properly filling up settings.json" << std::endl;
        return 1;
    }

    ScreenDimmer* screenDimmer = new ScreenDimmer(settings.ScreenWidth,settings.ScreenHeight);

    timerId = SetTimer(0, 1, TimerInterval, TimerProc);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        double currentTimeMillis = millisecondsSinceEpoch();

        double oldState = screenDimmer->getState() ;
        double newState = (1.0 * currentTimeMillis - 1.0 * startTimeMillis) / settings.shutdownDelay;
        screenDimmer->setState(newState);
            
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
