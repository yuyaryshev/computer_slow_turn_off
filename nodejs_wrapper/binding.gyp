{
  "targets": [
    {
      "target_name": "ScreenDimmer",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
	  "cflags_cc": ["-std=c++17"],
      "defines": [ "_UNICODE", "UNICODE", "NAPI_CPP_EXCEPTIONS"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")>",
        "../../src"
      ],
      "sources": [
        "src/addon.cpp",
        "../src/ScreenDimmer.cpp",
		"../src/utilFuncs.cpp"
      ],
	  "ldflags": [
        "-lstdc++"
      ],
	  "xcode_settings": {
        "OTHER_CPLUSPLUSFLAGS": ["-std=c++17", "-stdlib=libc++"],
      },
      "msvs_settings": {
        "VCCLCompilerTool": {
		 'RuntimeLibrary': 1,
		  "ExceptionHandling": 1,
          "AdditionalOptions": [ "/EHsc" ]
        },
	  "VCLinkerTool": {
            "GenerateDebugInformation": "true"
          }
      }
    }
  ]
}

