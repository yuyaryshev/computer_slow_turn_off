#include "stdafx.h"

#define _WIN32_WINNT 0x500

#include <windows.h>
#include <tchar.h>
#include <CommCtrl.h>
#include <fstream>
#include <iostream>
#include "json.hpp"
#include <algorithm>

using json = nlohmann::json;

int ScreenWidth = 1920;
int ScreenHeight = 1080;
double shutdownDelay = 10000;
bool doShutdown = true;
std::string password = "stop";



const double fullProgress = 1.3;
const int TimerInterval = 100;
const double ProgressBarOffset = 0.05;
const int ProgressBarX = (int)(ScreenWidth * ProgressBarOffset /2.0);
const int ProgressBarY = 10;
const int ProgressBarWidth = (int)(ScreenWidth*(1- ProgressBarOffset));
const int ProgressBarHeight = 10;
const int winAntiGlitterSize = 5;
const long topWinMinHeight = 32;
COLORREF backgroundColor = RGB(10, 10, 10);

double UpdateStep = (TimerInterval * fullProgress) / shutdownDelay;

double progress = 0.00;
HWND topWindow, bottomWindow, leftWindow, rightWindow, progressBar;
UINT_PTR timerId;

std::string userInputBuffer;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

double adjustedProgress(double p) {
    if (p < 1.0) {
        return p*0.4;
    }
    return 1.0*0.4+(p-1.0)*5;
}

long blackoutWidth() {
    return (long)(adjustedProgress(progress) * ScreenWidth / 2);
}

long blackoutHeight() {
    return (long)(adjustedProgress(progress) * ScreenHeight / 2);
}

long topWinBlackoutHeight() {
    long r = blackoutHeight();
    if (r < topWinMinHeight) {
        return topWinMinHeight;
    }
    return r;
}

void UpdateWindowSize(HWND hwnd, int x, int y, int width, int height) {
    SetWindowPos(hwnd, NULL, x, y, width, height, SWP_NOZORDER);
    if(height % 10 == 0) {
        InvalidateRect(hwnd, NULL, TRUE);
    }
}

void paintBackground(HWND* hwnd, COLORREF colorRef) {
    HBRUSH bgBrush = CreateSolidBrush(colorRef);
    SetClassLongPtr(*hwnd, GCLP_HBRBACKGROUND, (LONG_PTR)bgBrush);
//    RECT rect;
//    GetClientRect(*hwnd, &rect);
//    HDC hdc = GetDC(*hwnd);
//    HBRUSH bgBrush = CreateSolidBrush(colorRef);
//    SetClassLongPtr(*hwnd, GCLP_HBRBACKGROUND, (LONG)bgBrush);
//    FillRect((HDC)hdc, &rect, bgBrush);
//    SendMessage(*hwnd, PBM_SETBKCOLOR, 0, (LPARAM)colorRef);
//    DeleteObject(bgBrush);
//    ReleaseDC(*hwnd, hdc);
}


void CreateTopMostWindow(HWND* hwnd, int x, int y, int width, int height) {
    *hwnd = CreateWindowEx(
        WS_EX_TOPMOST,
        _T("STATIC"),
        NULL,
        WS_POPUP | WS_VISIBLE,
        x, y, width, height,
        NULL, NULL, GetModuleHandle(NULL), NULL);

    SetLayeredWindowAttributes(*hwnd, backgroundColor, 0, LWA_COLORKEY);

    // Subclass the window to intercept keyboard input
    SetWindowLongPtr(*hwnd, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(WindowProc));

    paintBackground(hwnd, backgroundColor);
    ShowWindow(*hwnd, SW_SHOW);
}

void CreateProgressBar(HWND parent) {
    progressBar = CreateWindowEx(
        0,
        PROGRESS_CLASS,
        NULL,
        WS_CHILD | WS_VISIBLE | PBS_SMOOTH,
        ProgressBarX, ProgressBarY, ProgressBarWidth, ProgressBarHeight,
        parent, NULL, GetModuleHandle(NULL), NULL);

    SendMessage(progressBar, PBM_SETRANGE, 0, MAKELPARAM(0, 10000));

    // Set the background color to black (RGB value)
    SendMessage(progressBar, PBM_SETBKCOLOR, 0, (LPARAM)backgroundColor);
}

void UpdateProgressBar() {
    if (progress > 1.0) {
        ShowWindow(progressBar, SW_HIDE);
        return;
    }
    int newPos = (int)((1.0-progress) * 10000);
    SendMessage(progressBar, PBM_SETPOS, newPos, 0);
}

void CALLBACK TimerProc(HWND hwnd, UINT uMsg, UINT_PTR idEvent, DWORD dwTime) {
    if (progress < fullProgress) {
        progress += UpdateStep;

        UpdateProgressBar();
        UpdateWindowSize(topWindow, 0, 0, ScreenWidth, topWinBlackoutHeight());
        UpdateWindowSize(bottomWindow, 0, ScreenHeight - blackoutHeight(), ScreenWidth, blackoutHeight() + winAntiGlitterSize);
        UpdateWindowSize(leftWindow, 0, blackoutHeight() - winAntiGlitterSize, blackoutWidth(), ScreenHeight - 2 * blackoutHeight() + winAntiGlitterSize * 2);
        UpdateWindowSize(rightWindow, ScreenWidth - blackoutWidth(), blackoutHeight() - winAntiGlitterSize, blackoutWidth() + winAntiGlitterSize, ScreenHeight - 2 * blackoutHeight() + winAntiGlitterSize * 2);
    }
    else {
        KillTimer(topWindow, timerId);
        if(doShutdown) {
          // Start the async shell command to initiate shutdown
          std::string shutdownCmd = "shutdown /s /t 30 /c \"The computer will shutdown after 30 seconds\"";
          system(shutdownCmd.c_str());
          ExitWindows(EWX_POWEROFF | EWX_FORCEIFHUNG, SHTDN_REASON_FLAG_PLANNED);
        }
        else {
            ExitProcess(0);
        }
    }
}

std::string strToLower(const std::string& s) {
    std::string result = s;
    std::transform(result.begin(), result.end(), result.begin(), [](unsigned char c) {
        return std::tolower(c);
        });
    return result;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    if (uMsg == WM_KEYUP) {
        char typedChar = static_cast<char>(wParam);
        userInputBuffer += typedChar;

        if (userInputBuffer.size() > password.size()) {
            userInputBuffer = userInputBuffer.substr(userInputBuffer.size() - password.size(), password.size());
        }

        if (strToLower(userInputBuffer) == strToLower(password)) {
            PostQuitMessage(0);
        }
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}


void LoadSettings() {
    json settings;

    // Try to open settings.json for reading
    std::ifstream settingsFile("settings.json");

    if (settingsFile.is_open()) {
        try {
            settingsFile >> settings;
        }
        catch (const std::exception& e) {
            std::cerr << "Error parsing settings.json: " << e.what() << std::endl;
        }
    }
    else {
        // If settings.json doesn't exist, create it and write default values
        settings["ScreenWidth"] = ScreenWidth;
        settings["ScreenHeight"] = ScreenHeight;
        settings["ShutdownDelay"] = shutdownDelay;
        settings["password"] = password;

        std::ofstream outFile("settings.json");
        if (outFile.is_open()) {
            outFile << settings.dump(4); // dump with indentation for readability
            outFile.close();
        }
        else {
            std::cerr << "Failed to create settings.json" << std::endl;
        }
    }

    // Retrieve constants from settings.json
    ScreenWidth = settings.value("ScreenWidth", 1920);
    ScreenHeight = settings.value("ScreenHeight", 1080);
    shutdownDelay = settings.value("ShutdownDelay", 0.001);    
    password = settings.value("password", "stop");
    doShutdown = !!settings.value("shutdown", 1);
    UpdateStep = (TimerInterval * fullProgress) / shutdownDelay;
}


int APIENTRY WinMain(HINSTANCE hInst, HINSTANCE hInstPrev, LPSTR cmd, int show) {
    LoadSettings();
    // Register a window class
    WNDCLASS wc = { 0 };
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = _T("MyWindowClass");
    RegisterClass(&wc);

    // Create top, bottom, left, and right windows
    CreateTopMostWindow(&topWindow, 0, 0, ScreenWidth, blackoutHeight());
    CreateTopMostWindow(&bottomWindow, 0, ScreenHeight - blackoutHeight(), ScreenWidth, blackoutHeight());
    CreateTopMostWindow(&leftWindow, 0, blackoutHeight(), blackoutWidth(), ScreenHeight - 2 * blackoutHeight());
    CreateTopMostWindow(&rightWindow, ScreenWidth - blackoutWidth(), blackoutHeight(), blackoutWidth(), ScreenHeight - 2 * blackoutHeight());

    // Create progress bar inside the top window
    CreateProgressBar(topWindow);

    // Create a timer to update the progress
    timerId = SetTimer(topWindow, 1, TimerInterval, TimerProc);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
