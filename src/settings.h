#pragma once

const double fullProgress = 1.3;
const int TimerInterval = 100;

struct Settings {
    long ScreenWidth = 1920;
    long ScreenHeight = 1080;
    double shutdownDelay = 10000;
    std::string password = "stop";
    bool doShutdown = true;
    double UpdateStep = 0.001;
};

Settings LoadSettings();