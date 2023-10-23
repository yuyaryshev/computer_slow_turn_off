#include "stdafx.h"

#define _WIN32_WINNT 0x500

#include <windows.h>
#include <tchar.h>
#include <CommCtrl.h>
#include <fstream>
#include <iostream>
#include <algorithm>

#include "utilFuncs.h"

std::string strToLower(const std::string& s) {
    std::string result = s;
    std::transform(result.begin(), result.end(), result.begin(), [](unsigned char c) {
        return std::tolower(c);
        });
    return result;
}
