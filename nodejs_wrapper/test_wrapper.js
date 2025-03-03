const {ScreenDimmer} = require('./index.js');

function awaitDelay(delay) {
	return new Promise(resolve=>{
		setTimeout(resolve, delay);
	})
}

async function cycle() {
	const timeout = 100;
	let i=0;
	for(; i< 1.2; i+= 0.05) {
		screenDimmer.setState(i);		
		await awaitDelay(timeout);
	}
	for(; i>0; i-= 0.05) {
		screenDimmer.setState(i);		
		await awaitDelay(timeout);
	}
}

async function main() {
	const version = screenDimmer.getVersion();
	console.log(`CODE00000000 getVersion()=${version}`);

	return
	
	const pass = screenDimmer.getPassword();		
	console.log(`CODE00000000 password=${pass}`);
	
	screenDimmer.setState(1);
	for(let i=0; i<200; i++) {
		if(screenDimmer.isPasswordEntered()) {
			return;
		}
		await awaitDelay(100);
	}
	screenDimmer.setState(0);		
	
	return
	screenDimmer.setState(1);		
	await awaitDelay(2000);
	screenDimmer.setState(0);		
	return
	await awaitDelay(2000);
	screenDimmer.setState(1);		
	await awaitDelay(2000);
	screenDimmer.setState(0);		
	await awaitDelay(2000);
	screenDimmer.setState(1);		
	await awaitDelay(2000);
	screenDimmer.setState(0);		
	await awaitDelay(2000);
	for(let i=0;i<5;i++) {
		await cycle();
	}
}

const screenWidth = 1920; 
const screenHeight = 1080;

const screenDimmer = new ScreenDimmer(screenWidth, screenHeight);
const newState = 0.5;
screenDimmer.setState(newState);

console.log('Current state:', screenDimmer.getState());

main().then();