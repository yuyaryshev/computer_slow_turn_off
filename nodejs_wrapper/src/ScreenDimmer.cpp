// ScreenDimmer.cpp

//#include "stdafx.h"

#define _WIN32_WINNT 0x500

#include <windows.h>
#include <tchar.h>
#include <CommCtrl.h>
#include <fstream>
#include <iostream>
#include <algorithm>

#include "utilFuncs.h"
#include "ScreenDimmer.h"

static bool winClassRegistered = false;

static const int winAntiGlitterSize = 5;

struct ScreenDimmerData {
	long screenWidth;
	long screenHeight;
	double state = 0;
	double progressBarOffset = 0.05;
	long topWinMinHeight = 32;

	std::string inputHolder;
	std::string password = "stop";
	std::string message = "";
	bool isPasswordEntered = false;

	bool winsExist = false;
	bool progressBarVisible = false;

	COLORREF backgroundColor = RGB(1, 1, 1);
	HWND topWindow = 0;
	HWND bottomWindow = 0;
	HWND leftWindow = 0;
	HWND rightWindow = 0;
	HWND progressBar = 0;

	int progressPos = 0;
};

static LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
static HWND CreateTopMostWindow(ScreenDimmerData* d);
static HWND CreateProgressBar(ScreenDimmerData* d, HWND parent);
static void DestroyTopMostWindow(HWND hwnd);
static void UpdateWindowSize(HWND hwnd, int x, int y, int width, int height);
static double adjustedProgress(double p);

static void YDoEventLoop() {
	MSG msg;
	while (GetMessage(&msg, NULL, 0, 0)) {
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}
}

ScreenDimmer::ScreenDimmer(long screenWidth, long screenHeight) {
	d = new ScreenDimmerData();
	d->screenWidth = screenWidth;
	d->screenHeight = screenHeight;
	refresh();
};

ScreenDimmer::~ScreenDimmer() {
	if (d) {
		setState(0);
		delete d;
		d = 0;
	}
};

double ScreenDimmer::getState() {
	YDoEventLoop();
	return d->state;
}

void ScreenDimmer::setState(double state) {
	d->state = state;
	refresh();
};

double ScreenDimmer::getStateMax() {
	return 1.3;
};

void ScreenDimmer::setStateMax() {
	setState(getStateMax());
};

void ScreenDimmer::incrementState(double additionToState) {
	setState(getState() + additionToState);
};

const std::string& ScreenDimmer::getPassword() {
	return d->password;
}

void ScreenDimmer::setPassword(const std::string& password) {
	d->password = password;
};

const std::string& ScreenDimmer::getMessage() {
	return d->message;
}

void ScreenDimmer::setMessage(const std::string& message) {
	d->message = message;
};

bool ScreenDimmer::isPasswordEntered() {
	YDoEventLoop();
	return d->isPasswordEntered;
}

void ScreenDimmer::resetPasswordEntered() {
	d->isPasswordEntered = false;
}

void ScreenDimmer::systemShutdown() {
	std::string shutdownCmd = "shutdown /s /t 30 /c \"The computer will shutdown after 30 seconds\"";
	system(shutdownCmd.c_str());
	ExitWindows(EWX_POWEROFF | EWX_FORCEIFHUNG, SHTDN_REASON_FLAG_PLANNED);
}

static double adjustedProgress(double p) {
		if (p < 1.0) {
			return p * 0.4;
		}
		return 1.0 * 0.4 + (p - 1.0) * 5;
	}

void ScreenDimmer::refresh() {
	bool o_progressBarVisible = d->progressBarVisible;
	int o_progressPos = d->progressPos;
	d->winsExist = d->state > 0;
	d->progressBarVisible = d->state > 0 && d->state < 1.0;

	long blackoutWidth= (long)(adjustedProgress(d->state) * d->screenWidth / 2);
	long blackoutHeight = (long)(adjustedProgress(d->state) * d->screenHeight / 2);
	long topWinBlackoutHeight = blackoutHeight < d->topWinMinHeight ? d->topWinMinHeight : blackoutHeight;

	d->progressPos = (int)((1.0 - d->state) * 10000);

	if (!winClassRegistered) {
		// Register a window class
		WNDCLASS wc = { 0 };
		wc.lpfnWndProc = WindowProc;
		wc.hInstance = GetModuleHandle(NULL);
		wc.lpszClassName = _T("ScreenDimmer");
		RegisterClass(&wc);
	}

	if (!!d->topWindow != d->winsExist) {
		if (d->winsExist) {
			d->topWindow = CreateTopMostWindow(d);
			d->bottomWindow = CreateTopMostWindow(d);
			d->leftWindow = CreateTopMostWindow(d);
			d->rightWindow = CreateTopMostWindow(d);
			d->progressBar = CreateProgressBar(d, d->topWindow);
			
			ShowWindow(d->topWindow, SW_SHOW);
			ShowWindow(d->bottomWindow, SW_SHOW);
			ShowWindow(d->leftWindow, SW_SHOW);
			ShowWindow(d->rightWindow, SW_SHOW);
		}
		else {
			ShowWindow(d->topWindow, SW_HIDE);
			ShowWindow(d->bottomWindow, SW_HIDE);
			ShowWindow(d->leftWindow, SW_HIDE);
			ShowWindow(d->rightWindow, SW_HIDE);
			
			//DestroyTopMostWindow(d->topWindow);
			//DestroyTopMostWindow(d->bottomWindow);
			//DestroyTopMostWindow(d->leftWindow);
			//DestroyTopMostWindow(d->rightWindow);

			//d->topWindow = 0;
			//d->bottomWindow = 0;
			//d->leftWindow = 0;
			//d->rightWindow = 0;
			//d->progressBar = 0;
		}
	}

	if (o_progressBarVisible != d->progressBarVisible) {
		if (d->progressBarVisible) {
			ShowWindow(d->progressBar, SW_SHOW);
		}
		else {
			ShowWindow(d->progressBar, SW_HIDE);
		}
	}

	if (d->progressBarVisible && o_progressPos != d->progressPos) {
		SendMessage(d->progressBar, PBM_SETPOS, d->progressPos, 0);
	}

	UpdateWindowSize(d->topWindow, 0, 0, d->screenWidth, topWinBlackoutHeight);
	UpdateWindowSize(d->bottomWindow, 0, d->screenHeight - blackoutHeight, d->screenWidth, blackoutHeight + winAntiGlitterSize);
	UpdateWindowSize(d->leftWindow, 0, blackoutHeight - winAntiGlitterSize, blackoutWidth, d->screenHeight - 2 * blackoutHeight + winAntiGlitterSize * 2);
	UpdateWindowSize(d->rightWindow, d->screenWidth - blackoutWidth, blackoutHeight - winAntiGlitterSize, blackoutWidth + winAntiGlitterSize, d->screenHeight - 2 * blackoutHeight + winAntiGlitterSize * 2);
};

static void UpdateWindowSize(HWND hwnd, int x, int y, int width, int height) {
	SetWindowPos(hwnd, NULL, x, y, width, height, SWP_NOZORDER);
	if (height % 10 == 0) {
		InvalidateRect(hwnd, NULL, TRUE);
	}
}

static LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
	ScreenDimmerData* d = reinterpret_cast<ScreenDimmerData*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));

    if (uMsg == WM_KEYUP) {
        char typedChar = static_cast<char>(wParam);
		d->inputHolder += typedChar;

        if (d->inputHolder.size() > d->password.size()) {
            d->inputHolder = d->inputHolder.substr(d->inputHolder.size() - d->password.size(), d->password.size());
        }

        if (strToLower(d->inputHolder) == strToLower(d->password)) {
			d->isPasswordEntered = true;
            //PostQuitMessage(0);
		}
	}
	else if(uMsg == WM_CLOSE) {
		return 0;
	}

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

static HWND CreateTopMostWindow(ScreenDimmerData* d) {
	HWND hwnd = CreateWindowEx(
		WS_EX_TOPMOST | WS_EX_TOOLWINDOW,
		_T("ScreenDimmer"),
		NULL,
		WS_POPUP | WS_VISIBLE,
		0, 0, 1, 1,
		NULL, NULL, GetModuleHandle(NULL), NULL);

	SetLayeredWindowAttributes(hwnd, d->backgroundColor, 0, LWA_COLORKEY);

	SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(d));
	//SetWindowLongPtr(hwnd, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(WindowProc));

	HBRUSH bgBrush = CreateSolidBrush(d->backgroundColor);
	SetClassLongPtr(hwnd, GCLP_HBRBACKGROUND, (LONG_PTR)bgBrush);
	ShowWindow(hwnd, SW_SHOW);
	return hwnd;
}

static void DestroyTopMostWindow(HWND hwnd) {
	if (IsWindow(hwnd)) {
		DestroyWindow(hwnd);
	}
}

static HWND CreateProgressBar(ScreenDimmerData* d, HWND parent) {
	const int ProgressBarX = (int)(d->screenWidth * d->progressBarOffset / 2.0);
	const int ProgressBarY = 10;
	const int ProgressBarWidth = (int)(d->screenWidth * (1 - d->progressBarOffset));
	const int ProgressBarHeight = 10;

	HWND progressBar = CreateWindowEx(
		0,
		PROGRESS_CLASS,
		NULL,
		WS_CHILD | WS_VISIBLE | PBS_SMOOTH,
		ProgressBarX, ProgressBarY, ProgressBarWidth, ProgressBarHeight,
		parent, NULL, GetModuleHandle(NULL), NULL);

	SendMessage(progressBar, PBM_SETRANGE, 0, MAKELPARAM(0, 10000));

	// Set the background color to black (RGB value)
	SendMessage(progressBar, PBM_SETBKCOLOR, 0, (LPARAM)d->backgroundColor);
	return progressBar;
}