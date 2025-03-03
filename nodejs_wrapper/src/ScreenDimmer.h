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
	
	double getStateMax();
	void setStateMax();
	
	void incrementState(double additionToState);
	void refresh();

	const std::string& getPassword();
	void setPassword(const std::string& password);

	const std::string& getMessage();
	void setMessage(const std::string& message);

	bool isPasswordEntered();
	void resetPasswordEntered();
	
	void systemShutdown();
};