#pragma once

struct ScreenDimmerData;

class ScreenDimmer {
private:
	ScreenDimmerData* d = 0;

public:
	ScreenDimmer(long screenWidth, long screenHeight);
	~ScreenDimmer();

	double getState();
	void setState(double state);	
	void incrementState(double additionToState);
	void refresh();

	const std::string& getPassword();
	void setPassword(const std::string& password);

	bool isPasswordEntered();
	void resetPasswordEntered();
	
	void systemShutdown();
};