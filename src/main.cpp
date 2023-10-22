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

static UINT_PTR timerId;
void CALLBACK TimerProc(HWND hwnd, UINT uMsg, UINT_PTR idEvent, DWORD dwTime) {}

int APIENTRY WinMain(HINSTANCE hInst, HINSTANCE hInstPrev, LPSTR cmd, int show) {
    Settings settings = LoadSettings();

    ScreenDimmer* screenDimmer = new ScreenDimmer(settings.ScreenWidth,settings.ScreenHeight);

    timerId = SetTimer(0, 1, TimerInterval, TimerProc);

    const double step = 0.001;

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        double newState = screenDimmer->getState() + step;
        screenDimmer->setState(newState);
            
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
